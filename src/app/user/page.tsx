"use client";

import { useState } from "react";

const tabs = ["我上傳的考古題", "我收藏的考古題", "私人資料夾"] as const;

type Tab = (typeof tabs)[number];

export default function UserPage() {
  const [activeTab, setActiveTab] = useState<Tab>("我上傳的考古題");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            我的頁面（假資料）
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            之後會改成綁定登入的 g.ntu.edu.tw 帳號。現在僅展示資訊架構。
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
          尚未登入 · 僅顯示示意資料
        </div>
      </header>

      <div className="border-b border-slate-200 text-sm">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 pb-2 text-xs ${
                  isActive
                    ? "border-[#498E7B] font-medium text-[#498E7B]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-4 space-y-4 text-xs">
        {activeTab === "我上傳的考古題" && (
          <>
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                我上傳的考古題
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                未來會顯示與此帳號相關的所有上傳紀錄，現在以三筆假資料做範例。
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  title: "計算機結構 第二次期中考",
                  lightning: 128,
                },
                {
                  title: "機率與統計 期末考",
                  lightning: 64,
                },
                {
                  title: "心理學概論 小考整理",
                  lightning: 21,
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      上傳時間：2024/05/12 · 目前閃電：{item.lightning}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-[#498E7B] hover:text-[#498E7B]"
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-600 hover:border-red-300"
                    >
                      刪除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {activeTab === "我收藏的考古題" && (
          <div className="space-y-2">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                我收藏的考古題
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                可以快速回到自己覺得有用的考古題，未來會顯示在個人收藏清單中。
              </p>
            </div>

            <div className="mt-2 space-y-2">
              {["線性代數 第二次期中考", "微積分 A 終極複習題"].map((title) => (
                <article
                  key={title}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                >
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      來源科系、教授、年份等資訊之後會由後端提供。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:border-[#498E7B] hover:text-[#498E7B]"
                  >
                    前往考古題
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === "私人資料夾" && (
          <div className="space-y-2">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                私人資料夾
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                之後可以自行建立資料夾，把收藏的考古題整理在一起，資料夾預設為
                private。
              </p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              {["期中考衝刺", "期末總整理", "研究所準備"].map((folder) => (
                <div
                  key={folder}
                  className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-slate-900">
                      {folder}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      內含 3 份考古題 · 僅自己可見
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:border-[#498E7B] hover:text-[#498E7B]"
                  >
                    開啟資料夾
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}



