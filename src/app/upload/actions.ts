'use server';

import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";
import { uploadToDrive } from "@/lib/drive";
import { createExam, getUserByEmail } from "@/lib/db/operations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

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
  const department = formData.get("department") as string | null;
  const yearRaw = formData.get("year") as string;
  const yearType = (formData.get("yearType") as string) || "ROC";
  const examType = formData.get("examType") as string;
  const answerType = formData.get("answerType") as string;
  const note = formData.get("note") as string;

  // Convert to ROC year based on user's selection (AD -> ROC)
  const yearNum = parseInt(yearRaw, 10);
  let year = yearRaw;

  if (yearType === "AD" && (isNaN(yearNum) || yearNum < 1911)) {
    throw new Error("年份錯誤！");
  }

  if (!isNaN(yearNum)) {
    if (yearType === "AD") {
      year = (yearNum - 1911).toString();
    } else if (yearType === "ROC") {
      year = yearNum.toString();
    } else if (yearNum > 1911) {
      // Fallback for legacy submissions without yearType
      year = (yearNum - 1911).toString();
    }
  }

  const filesData: Array<{ type: string; url: string; name: string; fileId?: string }> = [];

  const fileTypes = [
    { key: "file_question", type: "question" },
    { key: "file_official", type: "official" },
    { key: "file_unofficial", type: "unofficial" },
  ];

  const categoryMap: Record<string, string> = {
    question: "題目",
    official: "官方解答",
    unofficial: "非官方解答",
  };

  // Generate a short unique ID (4 bytes hex = 8 characters)
  const uniqueId = randomBytes(4).toString('hex');

  // Upload files sequentially to avoid hitting rate limits or issues
  for (const { key, type } of fileTypes) {
    const files = formData.getAll(key) as File[];
    for (const file of files) {
      if (file && file.size > 0 && file.name !== "undefined") {
        try {
          const lastDotIndex = file.name.lastIndexOf('.');
          const extension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : "";
          // Format: {考古題名稱}_{unique id}_{題目或官方解答或非官方解答}
          const newName = `${title}_${uniqueId}_${categoryMap[type]}${extension}`;

          const result = await uploadToDrive(file, undefined, newName);
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
    department: department || undefined,
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

