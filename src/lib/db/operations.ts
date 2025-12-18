import dbConnect from './connect';
import { User, Exam } from './models';

// Generic database operations

export async function ensureDbConnection() {
  await dbConnect();
}

// User operations

export async function getUserByEmail(email: string) {
  await ensureDbConnection();
  const user = await User.findOne({ email });
  return user ? user.toObject() : null;
}

export async function createUser(userData: { name?: string; email: string; image?: string }) {
  await ensureDbConnection();
  const newUser = new User(userData);
  await newUser.save();
  return newUser.toObject();
}

// Exam operations

export async function getExams(filter: Record<string, any> = {}) {
  await ensureDbConnection();
  // Use .lean() for better performance if just reading
  const exams = await Exam.find(filter).populate('uploadedBy', 'name email').lean();
  return exams;
}

export async function createExam(examData: {
  title: string;
  courseName: string;
  instructor?: string;
  department?: string;
  semester?: string;
  examType?: string;
  hasAnswers?: string;
  description?: string;
  files?: Array<{ type: string; url: string; name: string; fileId?: string }>;
  uploadedBy: string; // User ID
}) {
  await ensureDbConnection();
  const newExam = new Exam(examData);
  await newExam.save();

  // Update user's uploadedExams
  await User.findByIdAndUpdate(examData.uploadedBy, {
    $push: { uploadedExams: newExam._id }
  });

  return newExam.toObject();
}

// Trending operations (example)
export async function getTrendingExams(limit = 5) {
  await ensureDbConnection();
  const exams = await Exam.find({}).sort({ downloads: -1 }).limit(limit).lean();
  return exams;
}

type SearchKeywordType = "course" | "professor";
type SearchSortBy = "lightning" | "createdAt";

export interface SearchExamParams {
  keyword?: string;
  keywordType?: SearchKeywordType;
  yearStart?: number;
  yearEnd?: number;
  departments?: string[];
  examTypes?: string[];
  answerTypes?: string[];
  sortBy?: SearchSortBy;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchExamResult {
  _id: string;
  title: string;
  courseName: string;
  instructor?: string;
  department?: string;
  semester?: string;
  examType?: string;
  hasAnswers?: string;
  lightning: number;
  createdAt?: string;
}

function extractSemesterYear(semester?: string | null): number | null {
  if (!semester) return null;
  const digits = semester.match(/\d+/);
  if (!digits || digits.length === 0) return null;
  const parsed = parseInt(digits[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function searchExams({
  keyword,
  keywordType = "course",
  yearStart,
  yearEnd,
  departments = [],
  examTypes = [],
  answerTypes = [],
  sortBy = "lightning",
  sortOrder = "desc",
  page = 1,
  limit = 50,
}: SearchExamParams): Promise<{ exams: SearchExamResult[]; total: number }> {
  await ensureDbConnection();

  const filter: Record<string, unknown> = {};

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    if (keywordType === "professor") {
      filter.instructor = regex;
    } else {
      filter.courseName = regex;
    }
  }

  if (departments.length > 0) {
    filter.department = { $in: departments };
  }

  if (examTypes.length > 0) {
    filter.examType = { $in: examTypes };
  }

  if (answerTypes.length > 0) {
    filter.hasAnswers = { $in: answerTypes };
  }

  const sortKey = sortBy === "createdAt" ? "createdAt" : "lightning";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const rawExams = await Exam.find(filter)
    .sort({ [sortKey]: sortDirection })
    .lean();

  const startYear = typeof yearStart === "number" ? yearStart : undefined;
  const endYear = typeof yearEnd === "number" ? yearEnd : undefined;

  const filteredByYear = rawExams.filter((exam: any) => {
    if (startYear === undefined && endYear === undefined) {
      return true;
    }

    const numericYear = extractSemesterYear(exam.semester);
    if (numericYear === null) {
      return false;
    }

    if (startYear !== undefined && numericYear < startYear) {
      return false;
    }

    if (endYear !== undefined && numericYear > endYear) {
      return false;
    }

    return true;
  });

  const total = filteredByYear.length;

  const validPage = Math.max(page, 1);
  const validLimit = Math.max(limit, 1);
  const startIndex = (validPage - 1) * validLimit;
  const endIndex = startIndex + validLimit;

  const pagedResults = filteredByYear.slice(startIndex, endIndex).map((exam: any) => ({
    _id: exam._id.toString(),
    title: exam.title,
    courseName: exam.courseName,
    instructor: exam.instructor || undefined,
    department: exam.department || undefined,
    semester: exam.semester || undefined,
    examType: exam.examType || undefined,
    hasAnswers: exam.hasAnswers || undefined,
    lightning: exam.lightning ?? 0,
    createdAt: exam.createdAt ? exam.createdAt.toISOString() : undefined,
  }));

  return { exams: pagedResults, total };
}
