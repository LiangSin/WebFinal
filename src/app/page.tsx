export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Trending⚡️ 考古題
          </h1>
          <p className="mt-1 text-[0.9rem] text-slate-500">
            目前最熱門、被按最多閃電的考古題。實際按讚與排序之後會串接 API。
          </p>
        </div>
        <div className="rounded-full bg-[#FFCB47]/10 px-4 py-1 text-[0.9rem] font-medium text-[#b28719]">
          Prototype 版 · 目前僅介面展示
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[1.1rem] font-medium text-slate-700">
            今日最受歡迎考古題
          </h2>
          <span className="text-[0.9rem] text-slate-400">
            假資料示意 · 之後會改成從後端載入
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* 在後續步驟會改成共用元件與 mock data map */}
          <article className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-[0.9rem]">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-theme-color/10 px-2 py-0.5 text-[0.9rem] font-medium text-[#2f5c4f]">
                資工系 · 必修
              </span>
              <span className="flex items-center gap-1 text-[0.9rem] text-slate-500">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCB47]/90 text-[0.59rem] font-semibold text-slate-900">
                  ⚡
                </span>
                128
              </span>
            </div>
            <h3 className="line-clamp-2 text-[0.9rem] font-semibold text-slate-900">
              計算機結構 第二次期中考（含官方解答）
            </h3>
            <p className="mt-1 text-[0.9rem] text-slate-500">
              課程：計算機結構 ‧ 吳老師教授 · 113 學年度 · 期中考
            </p>
          </article>

          <article className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-[0.9rem]">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-theme-color/10 px-2 py-0.5 text-[0.9rem] font-medium text-[#2f5c4f]">
                電機系 · 選修
              </span>
              <span className="flex items-center gap-1 text-[0.9rem] text-slate-500">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCB47]/90 text-[0.59rem] font-semibold text-slate-900">
                  ⚡
                </span>
                96
              </span>
            </div>
            <h3 className="line-clamp-2 text-[0.9rem] font-semibold text-slate-900">
              機率與統計 期末考（含非官方解）
            </h3>
            <p className="mt-1 text-[0.9rem] text-slate-500">
              課程：機率與統計 ‧ 張老師教授 · 112 學年度 · 期末考
            </p>
          </article>

          <article className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-[0.9rem]">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-theme-color/10 px-2 py-0.5 text-[0.9rem] font-medium text-[#2f5c4f]">
                通識 · 社科
              </span>
              <span className="flex items-center gap-1 text-[0.9rem] text-slate-500">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCB47]/90 text-[0.59rem] font-semibold text-slate-900">
                  ⚡
                </span>
                74
              </span>
            </div>
            <h3 className="line-clamp-2 text-[0.9rem] font-semibold text-slate-900">
              心理學概論 小考總整理（僅題目）
            </h3>
            <p className="mt-1 text-[0.9rem] text-slate-500">
              課程：心理學概論 ‧ 李老師教授 · 111 學年度 · 小考
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
