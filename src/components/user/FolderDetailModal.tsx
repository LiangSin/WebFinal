"use client";

import { useState, useRef, useEffect } from "react";
import { updateFolder, deleteFolder, removeExamFromFolder } from "@/app/user/actions";

interface FolderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: {
    _id: string;
    name: string;
    description: string;
    exams: string[]; // IDs
  };
}

export function FolderDetailModal({ isOpen, onClose, folder }: FolderDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [description, setDescription] = useState(folder.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update local state when folder prop changes
  useEffect(() => {
    setName(folder.name);
    setDescription(folder.description);
  }, [folder]);

  // Handle click outside modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle click outside menu
  useEffect(() => {
    function handleClickOutsideMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [showMenu]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateFolder(folder._id, name, description);
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to update folder:", error);
      alert("更新失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("確定要刪除此資料夾嗎？")) return;
    try {
      await deleteFolder(folder._id);
      onClose();
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert("刪除失敗");
    }
  };

  const handleRemoveExam = async (examId: string) => {
    if (!confirm("確定要移除此考古題嗎？")) return;
    try {
        await removeExamFromFolder(folder._id, examId);
    } catch (error) {
        console.error("Failed to remove exam:", error);
        alert("移除失敗");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5"
      >
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">編輯資料夾</h2>
            <div>
              <label htmlFor="edit-name" className="block text-xs font-medium text-gray-700">
                資料夾名稱
              </label>
              <input
                type="text"
                id="edit-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-theme-color focus:outline-none focus:ring-1 focus:ring-theme-color"
              />
            </div>
            <div>
              <label htmlFor="edit-desc" className="block text-xs font-medium text-gray-700">
                備註
              </label>
              <textarea
                id="edit-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-theme-color focus:outline-none focus:ring-1 focus:ring-theme-color"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                    setIsEditing(false);
                    setName(folder.name);
                    setDescription(folder.description);
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-theme-color px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#3d7a69]"
              >
                儲存
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{folder.name}</h2>
                {folder.description && (
                  <p className="mt-1 text-sm text-gray-500">{folder.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                      </svg>
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 w-32 rounded-md border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                        >
                          編輯資料夾
                        </button>
                        <button
                          onClick={handleDelete}
                          className="block w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                        >
                          刪除資料夾
                        </button>
                      </div>
                    )}
                 </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <h3 className="mb-2 text-xs font-medium text-gray-500">
                內容 ({folder.exams.length})
              </h3>
              {folder.exams.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                  此資料夾還是空的
                  <br />
                  去逛逛考古題並加入吧！
                </div>
              ) : (
                <ul className="space-y-2">
                  {folder.exams.map((examId) => (
                    <li
                      key={examId}
                      className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">考古題 ID: {examId}</span>
                       <button
                        onClick={() => handleRemoveExam(examId)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        移除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
