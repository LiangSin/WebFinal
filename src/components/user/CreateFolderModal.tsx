"use client";

import { useState, useRef, useEffect } from "react";
import { createFolder } from "@/app/user/actions";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createFolder(name, description);
      onClose();
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert("建立資料夾失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5"
      >
        <h2 className="text-lg font-semibold text-gray-900">建立新資料夾</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-700">
              資料夾名稱
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-theme-color focus:outline-none focus:ring-1 focus:ring-theme-color"
              placeholder="例如：期中考衝刺"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-gray-700">
              備註（選填）
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-theme-color focus:outline-none focus:ring-1 focus:ring-theme-color"
              placeholder="關於這個資料夾的說明..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-theme-color px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#3d7a69] focus:outline-none focus:ring-2 focus:ring-theme-color focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "建立中..." : "建立"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
