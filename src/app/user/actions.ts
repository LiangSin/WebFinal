'use server';

import { ensureDbConnection } from '@/lib/db/operations';
import { User, Exam } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authConfig from '@/auth.config';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { deleteFromDrive } from '@/lib/drive';

// Helper to get current user ID
async function getCurrentUserId() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user || !session.user.email) {
      console.error("No session found in getCurrentUserId. Session:", session);
      return null;
    }

    await ensureDbConnection();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.error("User not found in DB for email:", session.user.email);
      return null;
    }
    
    return user._id;
  } catch (error) {
    console.error("Error in getCurrentUserId:", error);
    return null;
  }
}

export async function getUserFolders() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const user = await User.findById(userId).lean();
    // Transform to simple object and ensure _id is string
    return (user?.folders || []).map((folder: any) => ({
      _id: folder._id.toString(),
      name: folder.name,
      description: folder.description || '',
      exams: (folder.exams || []).map((id: any) => id.toString())
    }));
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
}

export async function getUserUploadedExams() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    // Ensure Exam model is registered by importing it (already done at top)
    // We populate uploadedExams. 
    // Note: If using lean(), populated fields are POJOs.
    const user = await User.findById(userId).populate({
      path: 'uploadedExams',
      model: Exam,
      options: { sort: { createdAt: -1 } }
    }).lean();

    if (!user || !user.uploadedExams) {
      return [];
    }

    return (user.uploadedExams as any[]).map((exam: any) => ({
      _id: exam._id.toString(),
      title: exam.title,
      courseName: exam.courseName,
      instructor: exam.instructor,
      semester: exam.semester,
      examType: exam.examType,
      hasAnswers: exam.hasAnswers,
      description: exam.description,
      lightning: exam.lightning || 0,
      createdAt: exam.createdAt ? exam.createdAt.toISOString() : null,
      files: (exam.files || []).map((f: any) => ({
        type: f.type,
        url: f.url,
        name: f.name,
        fileId: f.fileId,
        _id: f._id ? f._id.toString() : undefined // Ensure subdocument ID is string or undefined
      })),
    }));
  } catch (error) {
    console.error("Error fetching uploaded exams:", error);
    return [];
  }
}

export async function createFolder(name: string, description: string) {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.error("Create folder failed: Not authenticated");
    throw new Error('Not authenticated');
  }

  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        folders: {
          name,
          description,
          exams: []
        }
      }
    });
    
    revalidatePath('/user');
  } catch (error) {
    console.error("Database error creating folder:", error);
    throw new Error('Database error');
  }
}

export async function updateFolder(folderId: string, name: string, description: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  await User.updateOne(
    { _id: userId, 'folders._id': folderId },
    { 
      $set: { 
        'folders.$.name': name,
        'folders.$.description': description
      } 
    }
  );
  
  revalidatePath('/user');
}

export async function deleteFolder(folderId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  await User.findByIdAndUpdate(userId, {
    $pull: { folders: { _id: folderId } }
  });
  
  revalidatePath('/user');
}

export async function removeExamFromFolder(folderId: string, examId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  await User.updateOne(
    { _id: userId, 'folders._id': folderId },
    { 
      $pull: { 'folders.$.exams': examId } 
    }
  );
  
  revalidatePath('/user');
}

export async function updateExam(examId: string, data: {
  title: string;
  courseName: string;
  instructor: string;
  semester: string;
  examType: string;
  hasAnswers: string;
  description: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('Exam not found');

  if (exam.uploadedBy.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  await Exam.findByIdAndUpdate(examId, {
    $set: data
  });

  revalidatePath('/user');
}

export async function deleteExam(examId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('Exam not found');

  if (exam.uploadedBy.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  // 1. Delete files from Google Drive
  if (exam.files && exam.files.length > 0) {
    for (const file of exam.files) {
      if (file.fileId) {
        await deleteFromDrive(file.fileId);
      }
    }
  }

  // 2. Remove Exam document
  await Exam.findByIdAndDelete(examId);

  // 3. Remove references
  // Remove from uploader's list
  await User.findByIdAndUpdate(userId, {
    $pull: { uploadedExams: examId }
  });

  // Remove from all users' savedExams and folders
  await User.updateMany(
    {},
    {
      $pull: {
        savedExams: examId,
        "folders.$[].exams": examId
      }
    }
  );

  revalidatePath('/user');
}
