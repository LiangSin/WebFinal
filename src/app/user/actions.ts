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
    const user = await User.findById(userId).populate({
      path: 'folders.exams',
      model: Exam,
      select: 'title _id'
    }).lean();

    // Transform to simple object and ensure _id is string
    return (user?.folders || []).map((folder: any) => ({
      _id: folder._id.toString(),
      name: folder.name,
      description: folder.description || '',
      exams: (folder.exams || []).map((exam: any) => ({
        _id: exam._id.toString(),
        title: exam.title || '未知標題'
      }))
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
        _id: f._id ? f._id.toString() : undefined
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
    const newFolder = {
      name,
      description,
      exams: []
    };

    const user = await User.findByIdAndUpdate(
      userId, 
      { $push: { folders: newFolder } },
      { new: true } // Return the updated document
    ).lean();
    
    revalidatePath('/user');

    // Return the newly created folder (last one in the array)
    if (user && user.folders && user.folders.length > 0) {
      const createdFolder = user.folders[user.folders.length - 1];
      return {
        _id: createdFolder._id.toString(),
        name: createdFolder.name
      };
    }
    return null;
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

export async function getUserSavedExams() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const user = await User.findById(userId).populate({
      path: 'savedExams',
      model: Exam,
      options: { sort: { createdAt: -1 } }
    }).lean();

    if (!user || !user.savedExams) {
      return [];
    }

    return (user.savedExams as any[]).map((exam: any) => {
      // Find which folders this exam is in
      const savedInFolders = (user.folders || [])
        .filter((folder: any) => folder.exams.some((id: any) => id.toString() === exam._id.toString()))
        .map((folder: any) => folder._id.toString());

      return {
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
          _id: f._id ? f._id.toString() : undefined
        })),
        savedInFolders
      };
    });
  } catch (error) {
    console.error("Error fetching saved exams:", error);
    return [];
  }
}

export async function removeExamFromCollection(examId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  await User.findByIdAndUpdate(userId, {
    $pull: {
      savedExams: examId,
      "folders.$[].exams": examId
    }
  });

  revalidatePath('/user');
}
