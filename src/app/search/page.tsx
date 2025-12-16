export default function SearchPage() {
  return (
    <div className="flex gap-6">
      <section className="w-80 shrink-0 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-[1.1rem] font-semibold text-slate-900">搜尋考古題</h1>
        <p className="mt-1 text-[0.9rem] text-slate-500">
          目前僅為介面示意，之後會串接實際搜尋 API。
        </p>

        <div className="mt-4 space-y-4 text-[0.9rem]">
          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              關鍵字
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none ring-0 focus:border-theme-color"
              placeholder="輸入課程名稱或教授名"
            />
            <div className="mt-2 flex gap-2 text-[0.9rem] text-slate-500">
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="keywordType" defaultChecked />
                <span>用課程名稱搜尋</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="keywordType" />
                <span>用教授名搜尋</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              年份範圍
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none focus:border-theme-color"
                placeholder="111"
              />
              <span className="text-[0.9rem] text-slate-500">到</span>
              <input
                className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none focus:border-theme-color"
                placeholder="113"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">科系</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["資工系", "電機系", "數學系", "通識"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">
                考試類別
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["期中考", "期末考", "小考"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">
                是否包含答案
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["沒有", "包含官方解", "包含非官方解"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-theme-color px-3 py-1.5 text-[1.1rem] font-medium text-white hover:bg-[#3a7263]"
          >
            搜尋（目前僅更新下方假資料）
          </button>
        </div>
      </section>

      <section className="flex-1 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.1rem] font-semibold text-slate-900">
              搜尋結果（假資料）
            </h2>
            <p className="mt-1 text-[0.9rem] text-slate-500">
              未來會依照實際搜尋條件動態更新，現在先以固定 mock
              data 呈現版型。
            </p>
          </div>
          <div className="flex items-center gap-2 text-[0.9rem] text-slate-500">
            <span className="text-slate-400">排序：</span>
            <button className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.9rem] font-medium text-slate-700">
              依閃電數
            </button>
            <button className="rounded-full px-2 py-0.5 text-[0.9rem] text-slate-500 hover:bg-slate-100">
              依上傳時間
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-[0.9rem]">
          {[
            {
              title: "計算機網路 期末考",
              course: "計算機網路",
              professor: "陳老師",
              year: "113",
              type: "期末考",
              dept: "資工系",
              hasAnswer: "包含官方解",
              lightning: 54,
            },
            {
              title: "線性代數 第二次期中考",
              course: "線性代數",
              professor: "林老師",
              year: "112",
              type: "期中考",
              dept: "數學系",
              hasAnswer: "沒有",
              lightning: 37,
            },
            {
              title: "普通物理 小考總整理",
              course: "普通物理",
              professor: "王老師",
              year: "111",
              type: "小考",
              dept: "物理系",
              hasAnswer: "包含非官方解",
              lightning: 29,
            },
          ].map((item) => (
            <article
              key={item.title}
              className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <div>
                <h3 className="text-[0.9rem] font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-[0.9rem] text-slate-500">
                  課程：{item.course} ‧ {item.professor}教授 · {item.year}學年度 ·{" "}
                  {item.type}
                </p>
                <p className="mt-0.5 text-[0.9rem] text-slate-500">
                  科系：{item.dept} · {item.hasAnswer}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3 text-[0.8rem]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFCB47]/10 px-2 py-0.5 text-[0.9rem] font-medium text-[#b28719]">
                  ⚡ {item.lightning}
                </span>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[0.8rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                >
                  查看詳細
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


