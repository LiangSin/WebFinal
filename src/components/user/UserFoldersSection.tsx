"use client";

import { useState } from "react";
import { CreateFolderModal } from "@/components/user/CreateFolderModal";
import { FolderDetailModal } from "@/components/user/FolderDetailModal";

interface Folder {
  _id: string;
  name: string;
  description: string;
  exams: string[];
}

export function UserFoldersSection({ initialFolders }: { initialFolders: Folder[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // In a real app with optimistic updates, we might manage local state here too,
  // but for now we rely on Server Actions revalidating the page prop passed down.
  // However, the parent page needs to pass the *latest* data.
  // Since this is a Client Component receiving props from Server Component, 
  // it will update when the parent re-renders (which revalidatePath triggers).

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">
            私人資料夾
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            您可以自行建立資料夾整理考古題。
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-theme-color px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#3d7a69]"
        >
          + 新增資料夾
        </button>
      </div>

      {initialFolders.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-[0.9rem] text-slate-500">目前沒有資料夾</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-2 text-[11px] text-theme-color hover:underline"
          >
            建立第一個資料夾
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {initialFolders.map((folder) => (
            <div
              key={folder._id}
              className="flex cursor-pointer flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-theme-color/30 hover:bg-white"
              onClick={() => setSelectedFolder(folder)}
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
                <p className="mt-1 line-clamp-2 h-8 text-[11px] text-slate-500">
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
          onClose={() => setSelectedFolder(null)}
          folder={selectedFolder}
        />
      )}
    </div>
  );
}

