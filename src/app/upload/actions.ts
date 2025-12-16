'use server';

import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";
import { uploadToDrive } from "@/lib/drive";
import { createExam, getUserByEmail } from "@/lib/db/operations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function uploadExamAction(formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    throw new Error("User not found");
  }

  const title = formData.get("title") as string;
  const course = formData.get("course") as string;
  const professor = formData.get("professor") as string;
  const year = formData.get("year") as string;
  const examType = formData.get("examType") as string;
  const answerType = formData.get("answerType") as string;
  const note = formData.get("note") as string;

  const filesData: Array<{ type: string; url: string; name: string; fileId?: string }> = [];

  const fileTypes = [
    { key: "file_question", type: "question" },
    { key: "file_official", type: "official" },
    { key: "file_unofficial", type: "unofficial" },
  ];

  // Upload files sequentially to avoid hitting rate limits or issues
  for (const { key, type } of fileTypes) {
    const files = formData.getAll(key) as File[];
    for (const file of files) {
      if (file && file.size > 0 && file.name !== "undefined") {
        try {
          const result = await uploadToDrive(file);
          filesData.push({
            type,
            url: result.webViewLink || "",
            name: file.name,
            fileId: result.fileId || undefined,
          });
        } catch (error) {
            console.error(`Failed to upload file ${file.name}:`, error);
            // Continue or throw depending on requirements. 
            // For now, we continue but might want to alert user.
        }
      }
    }
  }

  if (filesData.length === 0) {
      // Maybe allow no files? But form validation says at least one.
      // We rely on frontend validation mostly, but server side check is good.
      // throw new Error("No files uploaded");
  }

  await createExam({
    title,
    courseName: course,
    instructor: professor,
    semester: year,
    examType,
    hasAnswers: answerType,
    description: note,
    files: filesData,
    uploadedBy: user._id.toString(),
  });

  revalidatePath("/user");
  redirect("/user");
}

