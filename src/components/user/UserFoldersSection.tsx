"use client";

import { useState, useEffect } from "react";
import { CreateFolderModal } from "@/components/user/CreateFolderModal";
import { FolderDetailModal } from "@/components/user/FolderDetailModal";
import { FolderPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ExamInFolder {
  _id: string;
  title: string;
}

interface Folder {
  _id: string;
  name: string;
  description: string;
  exams: ExamInFolder[];
}

export function UserFoldersSection({ initialFolders }: { initialFolders: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cast initialFolders to Folder[] to match our new interface
  const folders = initialFolders as Folder[];

  // Handle URL params for open folder
  useEffect(() => {
    const openFolderId = searchParams.get("folder");
    if (openFolderId) {
      // Only set if not already selected or different
      if (selectedFolder?._id !== openFolderId) {
        const folder = folders.find(f => f._id === openFolderId);
        if (folder) {
          setSelectedFolder(folder);
        }
      }
    } else {
        if (selectedFolder) {
           setSelectedFolder(null);
        }
    }
  }, [searchParams, folders, selectedFolder]);

  const handleOpenFolder = (folder: Folder) => {
    if (selectedFolder?._id === folder._id) return;
    // Don't set state here, let useEffect handle it after URL change to avoid race conditions/loops?
    // Actually better to set it to feel instant, but we must ensure we don't trigger loop.
    // If we update URL, searchParams changes -> useEffect fires -> setsSelectedFolder(same) -> no loop if we check equality.
    
    // setSelectedFolder(folder); // Optional, but useEffect will catch it.
    const params = new URLSearchParams(searchParams.toString());
    params.set("folder", folder._id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseFolder = () => {
    // setSelectedFolder(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("folder");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[0.9rem] font-semibold text-slate-800">
            私人資料夾
          </h2>
          <p className="mt-1 text-[0.7rem] text-slate-500">
            自行建立資料夾整理考古題
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-theme-color px-3 py-1.5 text-[0.9rem] font-medium text-white hover:bg-[#3d7a69]"
        >
          <span className="inline-flex items-center gap-1">
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
            <span>新增資料夾</span>
          </span>
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-[0.9rem] text-slate-500">目前沒有資料夾</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-2 text-[0.7rem] text-theme-color hover:underline"
          >
            建立第一個資料夾
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {folders.map((folder) => (
            <div
              key={folder._id}
              className="flex cursor-pointer flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-theme-color/30 hover:bg-white"
              onClick={() => handleOpenFolder(folder)}
            >
              <div>
                <div className="flex items-start justify-between">
                  <p className="truncate pr-2 text-[12px] font-semibold text-slate-900">
                    {folder.name}
                  </p>
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-600">
                    {folder.exams.length}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 h-8 text-[0.7rem] text-slate-500">
                  {folder.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateFolderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {selectedFolder && (
        <FolderDetailModal
          isOpen={!!selectedFolder}
          onClose={handleCloseFolder}
          folder={selectedFolder}
        />
      )}
    </div>
  );
}
