'use server';

import { ensureDbConnection } from '@/lib/db/operations';
import { User } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authConfig from '@/auth.config';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

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
  // This is a placeholder as we don't have exam selection UI fully integrated yet
  // but following requirements to "allow remove exam"
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
