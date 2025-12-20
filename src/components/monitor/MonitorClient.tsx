"use client";

import { useMemo, useState, useTransition } from "react";
import {
  adminLogout,
  deleteExamAdmin,
  fetchRecentExams,
  fetchReportedExams,
} from "@/app/monitor/actions";
import { MonitorExam, MonitorRange } from "@/app/monitor/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, PencilLine, RefreshCcw, LogOut, FileText } from "lucide-react";

interface MonitorClientProps {
  initialReported: MonitorExam[];
  initialRecent: MonitorExam[];
  initialRange: MonitorRange;
}

const RANGE_OPTIONS: { label: string; value: MonitorRange }[] = [
  { label: "本日", value: "today" },
  { label: "最近三天", value: "3days" },
  { label: "本週", value: "week" },
  { label: "本月", value: "month" },
  { label: "全部", value: "all" },
];

export default function MonitorClient({
  initialReported,
  initialRecent,
  initialRange,
}: MonitorClientProps) {
  const router = useRouter();
  const [reportedExams, setReportedExams] = useState(initialReported);
  const [recentExams, setRecentExams] = useState(initialRecent);
  const [selectedRange, setSelectedRange] = useState<MonitorRange>(initialRange);
  const [isPending, startTransition] = useTransition();
  const [isRefreshingReported, setIsRefreshingReported] = useState(false);
  const [isRefreshingRecent, setIsRefreshingRecent] = useState(false);

  const handleDelete = (examId: string) => {
    if (!confirm("確定要刪除此考古題嗎？刪除後將無法恢復。")) return;
    startTransition(async () => {
      await deleteExamAdmin(examId);
      setReportedExams((prev) => prev.filter((exam) => exam._id !== examId));
      setRecentExams((prev) => prev.filter((exam) => exam._id !== examId));
    });
  };

  const refreshReported = () => {
    setIsRefreshingReported(true);
    startTransition(async () => {
      try {
        const latest = await fetchReportedExams();
        setReportedExams(latest);
      } finally {
        setIsRefreshingReported(false);
      }
    });
  };

  const changeRange = (range: MonitorRange) => {
    if (range === selectedRange) return;
    setSelectedRange(range);
    setIsRefreshingRecent(true);
    startTransition(async () => {
      try {
        const list = await fetchRecentExams(range);
        setRecentExams(list);
      } finally {
        setIsRefreshingRecent(false);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogout();
      router.refresh();
    });
  };

  const currentRangeLabel = useMemo(
    () => RANGE_OPTIONS.find((o) => o.value === selectedRange)?.label ?? "",
    [selectedRange]
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">後台監控</h1>
          <p className="text-sm text-slate-500">
            僅開放給管理者，請勿分享此頁面。
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-300 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">被檢舉</h2>
            <p className="text-sm text-slate-500">
              近期被檢舉的考古題，可在這裡處理或刪除。
            </p>
          </div>
          <button
            onClick={refreshReported}
            disabled={isRefreshingReported}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-theme-color hover:text-theme-color disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <RefreshCcw className="h-4 w-4" />
            {isRefreshingReported ? "更新中..." : "重新整理"}
          </button>
        </div>

        {reportedExams.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
            目前沒有被檢舉的考古題
          </p>
        ) : (
          <div className="space-y-4">
            {reportedExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onDelete={() => handleDelete(exam._id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">近期上傳</h2>
            <p className="text-sm text-slate-500">
              最新上傳的考古題。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => changeRange(option.value)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedRange === option.value
                    ? "bg-theme-color/10 text-theme-color"
                    : "border border-slate-200 text-slate-600 hover:border-theme-color hover:text-theme-color"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isRefreshingRecent ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
            載入中...
          </p>
        ) : recentExams.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
            此區間沒有上傳紀錄
          </p>
        ) : (
          <div className="space-y-4">
            {recentExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onDelete={() => handleDelete(exam._id)}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

interface ExamCardProps {
  exam: MonitorExam;
  onDelete: () => void;
}

function ExamCard({ exam, onDelete }: ExamCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-400">ID: {exam._id}</p>
          <h3 className="text-lg font-semibold text-slate-900">{exam.title}</h3>
          <p className="text-sm text-slate-500">
            {exam.courseName} · {exam.instructor || "未提供"} ·{" "}
            {exam.semester || "無學年度"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/exam/${exam._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-theme-color hover:text-theme-color"
          >
            <FileText className="h-4 w-4" />
            查看詳情
          </Link>
          <Link
            href={`/monitor/exam/${exam._id}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-theme-color hover:text-theme-color"
          >
            <PencilLine className="h-4 w-4" />
            編輯
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            刪除
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
        <span>上傳：{exam.createdAt ? new Date(exam.createdAt).toLocaleString("zh-TW") : "未知"}</span>
        <span>解答：{exam.hasAnswers || "未標註"}</span>
        <span>類型：{exam.examType || "未標註"}</span>
        {exam.reportCount > 0 && (
          <span className="font-medium text-red-500">
            被檢舉 {exam.reportCount} 次 ·{" "}
            {exam.lastReportedAt
              ? new Date(exam.lastReportedAt).toLocaleString("zh-TW")
              : "無時間"}
          </span>
        )}
      </div>
      {exam.description && (
        <p className="mt-2 text-sm text-slate-600">{exam.description}</p>
      )}
    </article>
  );
}

