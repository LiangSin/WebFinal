'use server';

import { cookies } from 'next/headers';
import { ensureDbConnection } from '@/lib/db/operations';
import { Exam } from '@/lib/db/models';
import { uploadToDrive, deleteFromDrive } from '@/lib/drive';
import { MonitorExam, MonitorRange } from '@/app/monitor/types';
import { ADMIN_PASSWORD, ADMIN_USERNAME, MONITOR_COOKIE } from '@/app/monitor/config';

function mapExam(doc: any): MonitorExam {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    courseName: doc.courseName,
    instructor: doc.instructor || '',
    department: doc.department || '',
    semester: doc.semester || '',
    examType: doc.examType || '',
    hasAnswers: doc.hasAnswers || '',
    description: doc.description || '',
    reportCount: doc.reportCount ?? 0,
    lastReportedAt: doc.lastReportedAt ? doc.lastReportedAt.toISOString() : null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    files: (doc.files || []).map((file: any) => ({
      _id: file._id ? file._id.toString() : undefined,
      type: file.type,
      url: file.url,
      name: file.name,
      fileId: file.fileId,
    })),
  };
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MONITOR_COOKIE)?.value;
  if (token !== 'true') {
    throw new Error('未授權，請重新登入');
  }
}

export async function adminLogin(username: string, password: string) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(MONITOR_COOKIE, 'true', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/monitor',
      maxAge: 60 * 60 * 6, // 6 hours
    });
    return { success: true };
  }

  return { success: false, error: '帳號或密碼錯誤' };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(MONITOR_COOKIE);
  return { success: true };
}

export async function fetchReportedExams(): Promise<MonitorExam[]> {
  await requireAdmin();
  await ensureDbConnection();
  const exams = await Exam.find({ reportCount: { $gt: 0 } })
    .sort({ lastReportedAt: -1, createdAt: -1 })
    .limit(200)
    .lean();

  return exams.map(mapExam);
}

function getRangeStart(range: MonitorRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case '3days':
      now.setDate(now.getDate() - 3);
      return now;
    case 'week':
      now.setDate(now.getDate() - 7);
      return now;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      return now;
    case 'all':
    default:
      return null;
  }
}

export async function fetchRecentExams(range: MonitorRange): Promise<MonitorExam[]> {
  await requireAdmin();
  await ensureDbConnection();

  const filter: Record<string, unknown> = {};
  const since = getRangeStart(range);
  if (since) {
    filter.createdAt = { $gte: since };
  }

  const exams = await Exam.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return exams.map(mapExam);
}

const editableFields = [
  'title',
  'courseName',
  'instructor',
  'department',
  'semester',
  'examType',
  'hasAnswers',
  'description',
] as const;

type EditableField = (typeof editableFields)[number];

export type ExamUpdatePayload = Partial<Record<EditableField, string>>;

export async function updateExamAdmin(examId: string, updates: ExamUpdatePayload) {
  await requireAdmin();
  await ensureDbConnection();

  const payload: Record<string, unknown> = {};
  editableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      payload[field] = updates[field];
    }
  });

  const updated = await Exam.findByIdAndUpdate(
    examId,
    { $set: payload },
    { new: true }
  ).lean();

  if (!updated) {
    throw new Error('考古題不存在或已被刪除');
  }

  return mapExam(updated);
}

export async function deleteExamAdmin(examId: string) {
  await requireAdmin();
  await ensureDbConnection();
  await Exam.findByIdAndDelete(examId);
  return { success: true };
}

export async function clearExamReportCount(examId: string) {
  await requireAdmin();
  await ensureDbConnection();
  
  await Exam.findByIdAndUpdate(examId, {
    $set: { reportCount: 0, lastReportedAt: null }
  });
  
  return { success: true };
}

export async function getExamForAdmin(examId: string) {
  await requireAdmin();
  await ensureDbConnection();
  const exam = await Exam.findById(examId);
  if (!exam) return null;
  return mapExam(exam);
}

function validateFormFile(file: FormDataEntryValue | null): File {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error('缺少檔案');
  }
  return file;
}

export async function replaceExamFileAdmin(formData: FormData) {
  await requireAdmin();
  const examId = formData.get('examId')?.toString();
  const fileEntryId = formData.get('fileEntryId')?.toString();
  const file = validateFormFile(formData.get('file'));

  if (!examId || !fileEntryId) {
    throw new Error('缺少必要參數');
  }

  await ensureDbConnection();
  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('考古題不存在');

  const target: any = exam.files.id(fileEntryId);
  if (!target) throw new Error('檔案不存在');

  const uploadResult = await uploadToDrive(file);
  if (target.fileId) {
    await deleteFromDrive(target.fileId);
  }

  target.url = uploadResult.webViewLink || '';
  target.name = file.name;
  target.fileId = uploadResult.fileId || undefined;

  await exam.save();
  return mapExam(exam);
}

export async function addExamFileAdmin(formData: FormData) {
  await requireAdmin();
  const examId = formData.get('examId')?.toString();
  const fileType = formData.get('fileType')?.toString();
  const file = validateFormFile(formData.get('file'));

  if (!examId || !fileType) {
    throw new Error('缺少必要參數');
  }

  await ensureDbConnection();
  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('考古題不存在');

  const uploadResult = await uploadToDrive(file);
  exam.files.push({
    type: fileType,
    url: uploadResult.webViewLink || '',
    name: file.name,
    fileId: uploadResult.fileId || undefined,
  });

  await exam.save();
  return mapExam(exam);
}

export async function removeExamFileAdmin(examId: string, fileEntryId: string) {
  await requireAdmin();
  await ensureDbConnection();
  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('考古題不存在');

  const target: any = exam.files.id(fileEntryId);
  if (!target) throw new Error('檔案不存在');

  if (target.fileId) {
    await deleteFromDrive(target.fileId);
  }

  target.deleteOne();
  await exam.save();
  return mapExam(exam);
}

