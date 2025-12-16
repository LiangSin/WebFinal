"use client";

import { useState } from "react";
import { UserFoldersSection } from "@/components/user/UserFoldersSection";
import { Pencil, Trash2 } from "lucide-react";
import { EditExamModal } from "./EditExamModal";
import { deleteExam } from "@/app/user/actions";

const tabs = ["我上傳的考古題", "我收藏的考古題", "私人資料夾"] as const;

type Tab = (typeof tabs)[number];

interface UserPageProps {
  initialFolders?: any[]; // passed from Server Component wrapper
  uploadedExams?: any[];
}

export default function UserPage({ initialFolders = [], uploadedExams = [] }: UserPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("我上傳的考古題");
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未知時間";
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDelete = async (examId: string, title: string) => {
    if (confirm(`確定要刪除「${title}」嗎？\n此動作無法復原。`)) {
      setIsDeleting(true);
      try {
        await deleteExam(examId);
      } catch (error) {
        console.error("Failed to delete exam:", error);
        alert("刪除失敗");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <EditExamModal 
        isOpen={!!editingExam} 
        exam={editingExam} 
        onClose={() => setEditingExam(null)} 
      />
      
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[1.1rem] font-semibold text-slate-900">
            我的頁面
          </h1>
        </div>
      </header>

      <div className="border-b border-slate-200 text-[1.1rem]">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 pb-2 text-[0.9rem] ${isActive
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

      <section className="mt-4 space-y-4 text-[0.9rem]">
        {activeTab === "我上傳的考古題" && (
          <>
            <div>
              <h2 className="text-[0.9rem] font-semibold text-slate-800">
                我上傳的考古題
              </h2>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                您過去貢獻的考古題，感謝您的付出！
              </p>
            </div>

            <div className="space-y-2">
              {uploadedExams.length === 0 ? (
                <div className="py-4 text-center text-[0.9rem] text-slate-500">
                  目前還沒有上傳過任何考古題喔。
                </div>
              ) : (
                uploadedExams.map((item) => (
                  <article
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                  >
                    <div>
                      <h3 className="text-[0.9rem] font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[0.7rem] text-slate-500">
                        上傳時間：{formatDate(item.createdAt)} · 目前閃電：
                        {item.lightning}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[0.7rem]">
                      <button
                        type="button"
                        aria-label="編輯"
                        title="編輯"
                        onClick={() => setEditingExam(item)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="刪除"
                        title="刪除"
                        disabled={isDeleting}
                        onClick={() => handleDelete(item._id, item.title)}
                        className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[0.9rem] text-red-600 hover:border-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "我收藏的考古題" && (
          <div className="space-y-2">
            <div>
              <h2 className="text-[0.9rem] font-semibold text-slate-800">
                我收藏的考古題（假資料）
              </h2>
              <p className="mt-1 text-[0.7rem] text-slate-500">
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
                    <h3 className="text-[0.9rem] font-semibold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-[0.7rem] text-slate-500">
                      來源科系、教授、年份等資訊之後會由後端提供。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.7rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
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

