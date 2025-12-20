import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";
import { ensureDbConnection } from "@/lib/db/operations";
import { User, Exam } from "@/lib/db/models";

export async function POST(request: Request) {
  try {
    const { examId, note } = await request.json();

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "缺少考古題 ID" }, { status: 400 });
    }

    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    await ensureDbConnection();

    const reporter = await User.findOne({ email: session.user.email }).select("_id");
    if (!reporter) {
      return NextResponse.json({ error: "找不到使用者資料" }, { status: 401 });
    }

    const now = new Date();
    const trimmedNote =
      typeof note === "string" && note.trim().length > 0
        ? note.trim().slice(0, 200)
        : undefined;

    const update = await Exam.findByIdAndUpdate(
      examId,
      {
        $inc: { reportCount: 1 },
        $set: { lastReportedAt: now },
        $push: {
          reportHistory: {
            reportedAt: now,
            reportedBy: reporter._id,
            ...(trimmedNote ? { note: trimmedNote } : {}),
          },
        },
      },
      { new: true }
    ).select("reportCount lastReportedAt");

    if (!update) {
      return NextResponse.json({ error: "考古題不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reportCount: update.reportCount ?? 0,
      lastReportedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[ReportExam] error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

