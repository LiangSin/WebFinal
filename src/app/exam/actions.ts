'use server';

import { ensureDbConnection } from '@/lib/db/operations';
import { User, Exam } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authConfig from '@/auth.config';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// Helper to get current user ID
async function getCurrentUserId() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user || !session.user.email) {
      return null;
    }

    await ensureDbConnection();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return null;
    }
    
    return user._id;
  } catch (error) {
    console.error("Error in getCurrentUserId:", error);
    return null;
  }
}

export async function getExam(examId: string) {
  const userId = await getCurrentUserId();
  await ensureDbConnection();

  try {
    const exam = await Exam.findById(examId).lean();
    if (!exam) return null;

    let isSaved = false;
    let isFlashed = false;
    let savedInFolders: string[] = [];

    if (userId) {
      const user = await User.findById(userId).lean();
      if (user) {
        // Check if saved
        isSaved = user.savedExams?.some((id: any) => id.toString() === examId) || false;
        
        // Check if flashed
        isFlashed = user.flashedExams?.some((id: any) => id.toString() === examId) || false;
        
        // Check folders
        if (user.folders) {
          savedInFolders = user.folders
            .filter((folder: any) => folder.exams.some((id: any) => id.toString() === examId))
            .map((folder: any) => folder._id.toString());
        }
      }
    }

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
      isSaved,
      isFlashed,
      savedInFolders
    };
  } catch (error) {
    console.error("Error getting exam:", error);
    return null;
  }
}

export async function toggleLightning(examId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("請先登入");

  await ensureDbConnection();
  
  const user = await User.findById(userId);
  const exam = await Exam.findById(examId);

  if (!user || !exam) throw new Error("資料不存在");

  const isFlashed = user.flashedExams?.includes(examId);

  if (isFlashed) {
    // Remove flash
    await User.findByIdAndUpdate(userId, { $pull: { flashedExams: examId } });
    await Exam.findByIdAndUpdate(examId, { $inc: { lightning: -1 } });
  } else {
    // Add flash
    await User.findByIdAndUpdate(userId, { $addToSet: { flashedExams: examId } });
    await Exam.findByIdAndUpdate(examId, { $inc: { lightning: 1 } });
  }

  revalidatePath(`/exam/${examId}`);
  revalidatePath('/user');
}

export async function toggleCollection(examId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("請先登入");

  await ensureDbConnection();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isSaved = user.savedExams?.includes(examId);

  if (isSaved) {
    // Unsave: remove from savedExams AND all folders
    await User.findByIdAndUpdate(userId, {
      $pull: {
        savedExams: examId,
        "folders.$[].exams": examId
      }
    });
  } else {
    // Save: add to savedExams
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedExams: examId }
    });
  }

  revalidatePath(`/exam/${examId}`);
  revalidatePath('/user');
}

export async function updateExamFolders(examId: string, folderIds: string[]) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("請先登入");

  await ensureDbConnection();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // We need to iterate over all user folders.
  // For each folder:
  // - If it is in folderIds, add examId (addToSet)
  // - If it is NOT in folderIds, remove examId (pull)
  
  // Note: MongoDB bulkWrite or multiple updates might be needed, 
  // but since folder list is small, we can just do two updates:
  // 1. Pull examId from ALL folders not in folderIds (or just all, then add back?)
  // Better: Pull from all, then push to selected. 
  // Wait, if I pull from all, I lose the position if order matters? Order doesn't matter much here.
  
  // Strategy:
  // 1. Remove examId from all folders.
  // 2. Add examId to folders in folderIds.
  
  // 1. Remove from all
  await User.updateOne(
    { _id: userId },
    { $pull: { "folders.$[].exams": examId } }
  );

  // 2. Add to specific folders
  // We can't easily use arrayFilters for multiple specific IDs in one go with $addToSet efficiently if we want to target multiple specific array elements by ID.
  // Actually we can iterate.
  
  if (folderIds.length > 0) {
      // Use bulkWrite for efficiency if possible, or just a loop. Loop is fine for small N.
      // Or:
      await User.updateOne(
          { _id: userId },
          { 
              $addToSet: { "folders.$[elem].exams": examId } 
          },
          {
              arrayFilters: [ { "elem._id": { $in: folderIds } } ]
          }
      );
  }

  // Also ensure it is in savedExams if it's in a folder?
  // Requirement says: "In collection list... also record which folders".
  // Usually if I put it in a folder, it implies it is collected.
  // So let's ensure it's in savedExams too.
  await User.findByIdAndUpdate(userId, {
      $addToSet: { savedExams: examId }
  });

  revalidatePath(`/exam/${examId}`);
  revalidatePath('/user');
}

