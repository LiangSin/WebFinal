"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, Bookmark, FolderPlus, Download, Check, FileText, Flag, ArrowLeft } from "lucide-react";
import { toggleLightning, toggleCollection, updateExamFolders } from "@/app/exam/actions";
import { createFolder } from "@/app/user/actions"; // Reuse createFolder from user actions
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ExamDetailClientProps {
  exam: any;
  userFolders: any[];
  userId?: string | null;
}

export default function ExamDetailClient({ exam, userFolders: initialFolders, userId }: ExamDetailClientProps) {
  const router = useRouter();
  const [lightningCount, setLightningCount] = useState(exam.lightning);
  const [isFlashed, setIsFlashed] = useState(exam.isFlashed);
  const [isSaved, setIsSaved] = useState(exam.isSaved);
  const [savedInFolders, setSavedInFolders] = useState<string[]>(exam.savedInFolders || []);
  const [folders, setFolders] = useState(initialFolders);
  const [reportCount, setReportCount] = useState<number>(exam.reportCount ?? 0);
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUpdatingFolders, setIsUpdatingFolders] = useState(false);

  const folderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (folderMenuRef.current && !folderMenuRef.current.contains(event.target as Node)) {
        setShowFolderMenu(false);
        setIsCreatingFolder(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLightning = async () => {
    if (!userId) {
      alert("請先登入");
      return;
    }

    // Optimistic update
    const newStatus = !isFlashed;
    setIsFlashed(newStatus);
    setLightningCount((prev: number) => newStatus ? prev + 1 : prev - 1);

    try {
      await toggleLightning(exam._id);
    } catch (error) {
      console.error("Error toggling lightning:", error);
      // Revert
      setIsFlashed(!newStatus);
      setLightningCount((prev: number) => !newStatus ? prev + 1 : prev - 1);
    }
  };

  const handleReport = async () => {
    if (!userId) {
      alert("請先登入");
      return;
    }

    if (hasReported) {
      alert("已收到你的檢舉，感謝提供資訊！");
      return;
    }

    if (!confirm("確定要檢舉這份考古題嗎？")) {
      return;
    }

    setIsReporting(true);
    try {
      const response = await fetch("/api/exams/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId: exam._id }),
      });

      if (response.status === 401) {
        alert("請先登入");
        setIsReporting(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to report exam");
      }

      const data = await response.json();
      setReportCount(data.reportCount ?? reportCount + 1);
      setHasReported(true);
      alert("已收到你的檢舉，我們會盡快處理。");
    } catch (error) {
      console.error("Error reporting exam:", error);
      alert("檢舉失敗，請稍後再試。");
    } finally {
      setIsReporting(false);
    }
  };

  const handleCollection = async () => {
    if (!userId) {
      alert("請先登入");
      return;
    }

    if (isSaved) {
      // Just show menu if already saved (to allow uncollect or change folders)
      setShowFolderMenu(!showFolderMenu);
    } else {
      // If currently not saved, toggle on AND show menu
      setIsSaved(true);
      setShowFolderMenu(true);
      try {
        await toggleCollection(exam._id);
      } catch (error) {
        console.error("Error toggling collection:", error);
        setIsSaved(false);
        setShowFolderMenu(false);
      }
    }
  };

  const handleUncollection = async () => {
    if (!confirm("確定要取消收藏嗎？")) return;

    setIsSaved(false);
    setShowFolderMenu(false);
    setSavedInFolders([]); // Clear folders as well?

    try {
      await toggleCollection(exam._id);
      // Also we might need to clear folders on backend? 
      // toggleCollection handles basic unsave.
      // The backend implementation of toggleCollection does:
      // $pull: { savedExams: examId, "folders.$[].exams": examId }
      // So it clears folders too. Correct.
    } catch (error) {
      console.error("Error uncollecting:", error);
      setIsSaved(true);
    }
  }

  const handleFolderCheck = (folderId: string, checked: boolean) => {
    setSavedInFolders((prev) =>
      checked ? [...prev, folderId] : prev.filter((id) => id !== folderId)
    );
  };

  const applyFolderSelection = async () => {
    setIsUpdatingFolders(true);
    try {
      await updateExamFolders(exam._id, savedInFolders);
      alert("已更新收藏資料夾");
    } catch (error) {
      console.error("Error updating exam folders:", error);
      alert("更新資料夾失敗，請稍後再試");
    } finally {
      setIsUpdatingFolders(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    // Optimistically update UI
    const tempId = "temp-" + Date.now();
    const tempFolder = { _id: tempId, name: newFolderName, description: "", exams: [] };

    // Add to folders list
    setFolders([...folders, tempFolder]);

    // Check it (add to savedInFolders)
    setSavedInFolders([...savedInFolders, tempId]);

    try {
      // Call server action. Modified to return the new folder object.
      const newFolderData = await createFolder(newFolderName, "");

      if (newFolderData) {
        // Update with real ID
        setFolders(prev => prev.map(f => f._id === tempId ? { ...f, _id: newFolderData._id } : f));
        setSavedInFolders(prev => prev.map(id => id === tempId ? newFolderData._id : id));

      } else {
        // Fallback reload if we didn't get data back for some reason (shouldn't happen with updated action)
        window.location.reload();
      }

      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      // Revert on error
      setFolders(prev => prev.filter(f => f._id !== tempId));
      setSavedInFolders(prev => prev.filter(id => id !== tempId));
    }
  };

  const getFilesByType = (type: string) => {
    return exam.files.filter((f: any) => f.type === type);
  };

  const questionFiles = getFilesByType("question");
  const officialFiles = getFilesByType("official");
  const unofficialFiles = getFilesByType("unofficial");

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[0.85rem] text-slate-500 transition-colors hover:bg-slate-100 hover:text-theme-color focus:outline-none focus:ring-2 focus:ring-theme-color focus:ring-offset-2 focus:ring-offset-white"
      >
        <ArrowLeft className="h-4 w-4" />
        回前一頁
      </button>

      <div className="flex items-stretch gap-6">
        <section className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-slate-400">
                考古題編號 #{exam._id.substring(exam._id.length - 6)}
              </p>
              <h1 className="mt-2 text-xl font-semibold text-slate-900">
                {exam.title}
              </h1>
              <p className="mt-2 text-[1.1rem] text-slate-500">
                課程：{exam.courseName} ‧ {exam.instructor} ‧ {exam.semester} ‧{" "}
                {exam.examType}
              </p>
              <p className="mt-2 text-[0.8rem] text-slate-500">
                是否包含答案：{exam.hasAnswers}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-[1rem]">
              <button
                type="button"
                onClick={handleLightning}
                className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[0.8rem] font-medium transition-colors ${isFlashed
                  ? "bg-[#FFCB47] text-white"
                  : "bg-[#FFCB47]/10 text-[#b28719] hover:bg-[#FFCB47]/20"
                  }`}
              >
                <Zap className={`h-4 w-4 ${isFlashed ? "fill-white" : "fill-[#b28719]"}`} />
                {lightningCount} 個閃電
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleCollection}
                  className={`flex items-center gap-1 rounded-md border px-4 py-1.5 text-[0.8rem] transition-colors ${isSaved
                    ? "border-theme-color bg-theme-color text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-theme-color hover:text-theme-color"
                    }`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
                  {isSaved ? "已收藏" : "收藏 / 加入資料夾"}
                </button>

                {/* Folder Selection Menu */}
                {showFolderMenu && isSaved && (
                  <div
                    ref={folderMenuRef}
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
                            checked={savedInFolders.includes(folder._id)}
                            onChange={(e) => handleFolderCheck(folder._id, e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-theme-color focus:ring-theme-color"
                          />
                          <span className="text-[0.8rem] text-slate-700 truncate">{folder.name}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={applyFolderSelection}
                      disabled={isUpdatingFolders}
                      className={`mt-2 w-full rounded-md px-2 py-1 text-[0.8rem] font-medium text-white ${isUpdatingFolders
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-theme-color hover:bg-[#3d7a69]"
                        }`}
                    >
                      {isUpdatingFolders ? "更新中..." : "加入資料夾"}
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
                        <>
                          <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[0.8rem] text-theme-color hover:bg-slate-50"
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                            新增資料夾
                          </button>
                          <button
                            onClick={handleUncollection}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[0.8rem] text-red-500 hover:bg-red-50 mt-1"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                            取消收藏
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-[1rem]">
            {[
              { label: "題目檔案", files: questionFiles },
              { label: "官方解答", files: officialFiles },
              { label: "非官方解答", files: unofficialFiles },
            ].map((group) => (
              <div
                key={group.label}
                className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/70 p-4"
              >
                <p className="text-[0.8rem] font-medium text-slate-700">
                  {group.label} ({group.files.length})
                </p>
                {group.files.length === 0 ? (
                  <p className="mt-3 text-[0.8rem] text-slate-400 italic">無檔案</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-[0.8rem] text-slate-600">
                    {group.files.map((file: any) => (
                      <li
                        key={file._id || file.fileId || file.url}
                        className="flex items-center justify-between rounded bg-white px-3 py-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-theme-color hover:bg-theme-color hover:text-white transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          下載
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/40 p-4 text-[0.8rem] text-slate-600">
            <p className="font-medium text-slate-700">其他說明</p>
            <p className="mt-2 whitespace-pre-wrap text-[0.9rem]">
              {exam.description || "無其他說明"}
            </p>
          </section>
        </section>

        <aside className="flex w-80 shrink-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-[1rem]">
          <div>
            <p className="text-[0.8rem] font-medium text-slate-700">簡要資訊</p>
            <dl className="mt-3 space-y-2 text-[0.8rem] text-slate-600">
              <div className="flex justify-between">
                <dt className="text-slate-500">上傳者</dt>
                <dd>匿名</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">上傳時間</dt>
                <dd suppressHydrationWarning>{exam.createdAt ? new Date(exam.createdAt).toLocaleString('zh-TW') : '未知'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">檔案總數</dt>
                <dd>{exam.files.length} 個</dd>
              </div>
            </dl>
          </div>

          <div className="-mx-5 -mb-5 flex flex-col items-center border-t border-slate-100 px-5 pb-5 pt-6">
            <button
              type="button"
              onClick={handleReport}
              disabled={isReporting || hasReported}
              className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1 text-[0.75rem] font-medium transition-colors ${hasReported
                ? "border-red-100 bg-red-50 text-red-400 cursor-not-allowed"
                : "border-red-200 bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              aria-disabled={isReporting || hasReported}
            >
              <Flag className="h-3.5 w-3.5" />
              {hasReported ? "已檢舉" : isReporting ? "檢舉中..." : "檢舉"}
            </button>
            <p className="mt-1 text-center text-[0.7rem] text-slate-500">
              已被檢舉 {reportCount} 次
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

