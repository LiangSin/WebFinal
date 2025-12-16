import { getExam } from "@/app/exam/actions";
import { getUserFolders } from "@/app/user/actions";
import ExamDetailClient from "@/components/exam/ExamDetailClient";
import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";
import { notFound } from "next/navigation";
import { User } from "@/lib/db/models";
import { ensureDbConnection } from "@/lib/db/operations";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  
  // Fetch exam data
  const exam = await getExam(id);

  if (!exam) {
    notFound();
  }

  // Fetch user folders if logged in
  let userFolders = [];
  let userId = null;

  if (session?.user?.email) {
    await ensureDbConnection();
    const user = await User.findOne({ email: session.user.email });
    if (user) {
        userId = user._id.toString();
        // We can use getUserFolders, but that function gets session internally.
        // It's fine to call it.
        userFolders = await getUserFolders();
    }
  }

  return (
    <ExamDetailClient 
      exam={exam} 
      userFolders={userFolders}
      userId={userId}
    />
  );
}
