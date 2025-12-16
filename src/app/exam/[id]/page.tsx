interface ExamDetailPageProps {
  params: { id: string };
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = params;

  return (
    <div className="flex gap-6">
      <section className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] text-slate-400">考古題編號 #{id}</p>
            <h1 className="mt-1 text-base font-semibold text-slate-900">
              計算機結構 第二次期中考（含官方解答）
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              課程：計算機結構 ‧ 吳老師教授 · 113 學年度 · 期中考 · 資工系
            </p>
            <p className="mt-1 text-[0.65rem] text-slate-500">
              是否包含答案：官方解答、非官方解答
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-[#FFCB47]/10 px-3 py-1 text-[0.65rem] font-medium text-[#b28719]"
            >
              ⚡ 128 個閃電
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[0.65rem] text-slate-700 hover:border-theme-color hover:text-theme-color"
              >
                收藏 / 加入資料夾
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[0.65rem] text-slate-700 hover:border-theme-color hover:text-theme-color"
              >
                之後可以在這裡按閃電
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          {[
            { label: "題目檔案", files: ["midterm2_questions.pdf", "page1.jpg"] },
            { label: "官方解答", files: ["midterm2_solution_official.pdf"] },
            { label: "非官方解答", files: ["midterm2_solution_note.pdf"] },
          ].map((group) => (
            <div
              key={group.label}
              className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/70 p-3"
            >
              <p className="text-[0.65rem] font-medium text-slate-700">
                {group.label}
              </p>
              <ul className="mt-2 space-y-1 text-[0.65rem] text-slate-600">
                {group.files.map((file) => (
                  <li
                    key={file}
                    className="flex items-center justify-between rounded bg-white px-2 py-1"
                  >
                    <span className="truncate">{file}</span>
                    <button
                      type="button"
                      className="text-[0.65rem] text-theme-color hover:underline"
                    >
                      下載
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/40 p-3 text-[0.65rem] text-slate-600">
          <p className="font-medium text-slate-700">其他說明</p>
          <p className="mt-1">
            我的字很醜請見諒 QQ。這份考古題難度偏高，建議搭配老師的習題講義一起練習。
          </p>
        </section>
      </section>

      <aside className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white p-4 text-xs">
        <p className="text-[0.65rem] font-medium text-slate-700">簡要資訊</p>
        <dl className="mt-2 space-y-1 text-[0.65rem] text-slate-600">
          <div className="flex justify-between">
            <dt className="text-slate-500">上傳者</dt>
            <dd>匿名</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">上傳時間</dt>
            <dd>2024/05/12 21:30</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">檔案總數</dt>
            <dd>4 個</dd>
          </div>
        </dl>

        <p className="mt-4 text-[0.65rem] font-medium text-slate-700">
          之後會在這裡顯示：
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-[0.65rem] text-slate-500">
          <li>與此考古題相關的推薦考古題</li>
          <li>收藏到哪些資料夾</li>
          <li>實際的檔案預覽畫面</li>
        </ul>
      </aside>
    </div>
  );
}


