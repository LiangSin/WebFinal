"use client";

import { useState } from "react";
import { UserFoldersSection } from "@/components/user/UserFoldersSection";

const tabs = ["我上傳的考古題", "我收藏的考古題", "私人資料夾"] as const;

type Tab = (typeof tabs)[number];

interface UserPageProps {
  initialFolders?: any[]; // passed from Server Component wrapper
}

export default function UserPage({ initialFolders = [] }: UserPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("我上傳的考古題");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            我的頁面
          </h1>
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
                    ? "border-theme-color font-medium text-theme-color"
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
                我上傳的考古題（假資料）
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
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-theme-color hover:text-theme-color"
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
                我收藏的考古題（假資料）
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
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:border-theme-color hover:text-theme-color"
                  >
                    前往考古題
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === "私人資料夾" && (
          <UserFoldersSection initialFolders={initialFolders} />
        )}
      </section>
    </div>
  );
}

