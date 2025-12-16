import Link from "next/link";
import { Zap } from "lucide-react";
import { getTrendingExams } from "@/app/exam/actions";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const trendingExams = await getTrendingExams(10);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Trending⚡️ 考古題
          </h1>
          <p className="mt-1 text-[0.9rem] text-slate-500">
            目前最熱門、被按最多閃電的考古題⚡️
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[1.1rem] font-medium text-slate-700">
            最受歡迎考古題
          </h2>
        </div>
        
        {trendingExams.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            目前還沒有考古題資料。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {trendingExams.map((exam) => (
              <Link
                key={exam._id}
                href={`/exam/${exam._id}`}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-theme-color/50 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-[0.95rem] font-semibold text-slate-900 line-clamp-2 group-hover:text-theme-color">
                      {exam.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFCB47]/10 px-2 py-0.5 text-[0.7rem] font-medium text-[#b28719]">
                      <Zap className="h-3 w-3 fill-[#b28719]" />
                      <span>{exam.lightning}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-[0.8rem] text-slate-500">
                    <p>課程：{exam.courseName} ‧ {exam.instructor}</p>
                    <p>{exam.semester} ‧ {exam.examType}</p>
                    <p>解答：{exam.hasAnswers}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                  <span className="text-[0.75rem] text-slate-400 group-hover:text-theme-color">
                    查看詳情 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
