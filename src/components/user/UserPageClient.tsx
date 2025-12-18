"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { UserFoldersSection } from "@/components/user/UserFoldersSection";
import { Pencil, Trash2, Folder, FolderPlus, X } from "lucide-react";
import { EditExamModal } from "./EditExamModal";
import { deleteExam, removeExamFromCollection, updateFolder, createFolder } from "@/app/user/actions"; 
import { updateExamFolders } from "@/app/exam/actions"; 
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams

const tabs = ["我上傳的考古題", "我收藏的考古題", "私人資料夾"] as const;

type Tab = (typeof tabs)[number];

interface UserPageProps {
  initialFolders?: any[];
  uploadedExams?: any[];
  savedExams?: any[];
}

export default function UserPage({ initialFolders = [], uploadedExams = [], savedExams = [] }: UserPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize activeTab from URL or default
  const tabParam = searchParams.get("tab");
  const initialTab: Tab = (tabs.includes(tabParam as any) ? tabParam : "我上傳的考古題") as Tab;
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for saved exams folder management
  // Update URL when tab changes
  useEffect(() => {
    // Only update if the URL tab param is different from activeTab state to avoid loop
    const currentTabParam = searchParams.get("tab");
    if (currentTabParam !== activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, router, searchParams]);

  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [folders, setFolders] = useState(initialFolders);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUpdatingMap, setIsUpdatingMap] = useState<Record<string, boolean>>({});
  const [savedSelections, setSavedSelections] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        savedExams.map((exam) => [exam._id, exam.savedInFolders || []])
      )
  );

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

  const handleRemoveCollection = async (examId: string, title: string) => {
    // No confirmation needed per prompt? "Delete button becomes remove collection... no need to popup warning"
    // Prompt: "刪除按鈕會變成移除收藏和資料夾的儲存，而不是刪除整個考古題條目，也就不用跳視窗警告了。"
    // So just do it.
    try {
      await removeExamFromCollection(examId);
    } catch (error) {
      console.error("Failed to remove collection:", error);
      alert("移除失敗");
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopoverId(null);
        setIsCreatingFolder(false);
      }
    }
    if (activePopoverId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activePopoverId]);

  const getSavedSelection = (examId: string) =>
    savedSelections[examId] ??
    savedExams.find((e) => e._id === examId)?.savedInFolders ??
    [];

  const handleFolderCheck = (examId: string, folderId: string, checked: boolean) => {
    setSavedSelections((prev) => {
      const current = prev[examId] ?? [];
      const next = checked
        ? Array.from(new Set([...current, folderId]))
        : current.filter((id) => id !== folderId);
      return { ...prev, [examId]: next };
    });
  };

  const applyFolderSelection = async (examId: string) => {
    const selection = getSavedSelection(examId);
    setIsUpdatingMap((prev) => ({ ...prev, [examId]: true }));
    try {
      await updateExamFolders(examId, selection);
      alert("已更新收藏資料夾");
    } catch (error) {
      console.error("Error updating exam folders:", error);
      alert("更新資料夾失敗，請稍後再試");
    } finally {
      setIsUpdatingMap((prev) => ({ ...prev, [examId]: false }));
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName, "");
      setNewFolderName("");
      setIsCreatingFolder(false);
      // Wait for revalidation?
      // Since we are in client component, we might need a hard reload or wait for next render if server action revalidates.
      // folders state should be updated if the parent re-renders with new props.
      // But we are using initialFolders prop as initial state for 'folders'.
      // Wait, 'initialFolders' comes from server. If server revalidates, the page re-renders, and 'UserPage' gets new 'initialFolders'.
      // But 'useState(initialFolders)' only initializes once.
      // We should use 'initialFolders' directly or sync it.
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };
  
  // Sync folders state with props
  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  // Sync saved selections when savedExams change (e.g., after reload)
  useEffect(() => {
    setSavedSelections(
      Object.fromEntries(
        savedExams.map((exam) => [exam._id, exam.savedInFolders || []])
      )
    );
  }, [savedExams]);

  const handleItemClick = (e: React.MouseEvent, examId: string) => {
    // Prevent navigation if clicking buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    router.push(`/exam/${examId}`);
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
                    onClick={(e) => handleItemClick(e, item._id)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 hover:bg-slate-100 transition-colors"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExam(item);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="刪除"
                        title="刪除"
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id, item.title);
                        }}
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
                我收藏的考古題
              </h2>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                快速複習有用的考古題💪
              </p>
            </div>

            <div className="mt-2 space-y-2">
              {savedExams.length === 0 ? (
                 <div className="py-4 text-center text-[0.9rem] text-slate-500">
                   目前還沒有收藏任何考古題。
                 </div>
              ) : (
                savedExams.map((item) => (
                  <article
                    key={item._id}
                    onClick={(e) => handleItemClick(e, item._id)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-[0.9rem] font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[0.7rem] text-slate-500">
                        {item.courseName} · {item.instructor} · {item.semester}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      {/* Folder Button with Popover */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopoverId(activePopoverId === item._id ? null : item._id);
                            setIsCreatingFolder(false);
                          }}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-theme-color hover:text-theme-color"
                        >
                          <Folder className="h-4 w-4" />
                        </button>

                        {activePopoverId === item._id && (
                          <div 
                            ref={popoverRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-10"
                          >
                             <p className="mb-2 px-1 text-[0.7rem] font-medium text-slate-500">
                               選擇要加入的資料夾
                             </p>
                             <div className="max-h-48 overflow-y-auto space-y-1">
                                {folders.map((folder: any) => (
                                  <label 
                                    key={folder._id}
                                    className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={getSavedSelection(item._id).includes(folder._id)}
                                      onChange={(e) =>
                                        handleFolderCheck(item._id, folder._id, e.target.checked)
                                      }
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-theme-color focus:ring-theme-color"
                                    />
                                    <span className="text-[0.8rem] text-slate-700 truncate">{folder.name}</span>
                                  </label>
                                ))}
                             </div>

                             <button
                               type="button"
                               onClick={() => applyFolderSelection(item._id)}
                               disabled={!!isUpdatingMap[item._id]}
                               className={`mt-2 w-full rounded-md px-2 py-1 text-[0.8rem] font-medium text-white ${
                                 isUpdatingMap[item._id]
                                   ? "bg-slate-400 cursor-not-allowed"
                                   : "bg-theme-color hover:bg-[#3d7a69]"
                               }`}
                             >
                               {isUpdatingMap[item._id] ? "更新中..." : "加入資料夾"}
                             </button>
                             
                             <div className="mt-2 border-t border-slate-100 pt-2">
                                {isCreatingFolder ? (
                                  <form onSubmit={handleCreateFolder} className="px-1">
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder="資料夾名稱"
                                      value={newFolderName}
                                      onChange={(e) => setNewFolderName(e.target.value)}
                                      className="w-full rounded border border-slate-200 px-2 py-1 text-[0.8rem] focus:border-theme-color focus:outline-none"
                                    />
                                    <div className="mt-1 flex justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setIsCreatingFolder(false)}
                                        className="text-[0.7rem] text-slate-500 hover:text-slate-700"
                                      >
                                        取消
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!newFolderName.trim()}
                                        className="rounded bg-theme-color px-2 py-0.5 text-[0.7rem] text-white hover:bg-[#3d7a69]"
                                      >
                                        建立
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[0.8rem] text-theme-color hover:bg-slate-50"
                                  >
                                    <FolderPlus className="h-3.5 w-3.5" />
                                    新增資料夾
                                  </button>
                                )}
                              </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCollection(item._id, item.title);
                        }}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.9rem] text-slate-600 hover:border-red-300 hover:text-red-600"
                      >
                         <X className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
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
