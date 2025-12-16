"use client";

import { useState, useRef, useEffect } from "react";
import { updateExam } from "@/app/user/actions";

interface EditExamModalProps {
  exam: any | null; // Using any for simplicity as Exam type is complex, but could be tighter
  isOpen: boolean;
  onClose: () => void;
}

type ExamType = "期中考" | "期末考" | "小考";
type AnswerType = "沒有" | "包含官方解" | "包含非官方解";

export function EditExamModal({ exam, isOpen, onClose }: EditExamModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    courseName: "",
    instructor: "",
    semester: "",
    examType: "" as ExamType | "",
    hasAnswers: "" as AnswerType | "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && exam) {
      setFormData({
        title: exam.title || "",
        courseName: exam.courseName || "",
        instructor: exam.instructor || "",
        semester: exam.semester || "",
        examType: (exam.examType as ExamType) || "",
        hasAnswers: (exam.hasAnswers as AnswerType) || "",
        description: exam.description || "",
      });
    }
  }, [isOpen, exam]);

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

  if (!isOpen || !exam) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateExam(exam._id, {
        title: formData.title,
        courseName: formData.courseName,
        instructor: formData.instructor,
        semester: formData.semester,
        examType: formData.examType,
        hasAnswers: formData.hasAnswers,
        description: formData.description,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update exam:", error);
      alert("更新失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseInputClass =
    "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-[0.9rem] shadow-sm focus:border-theme-color focus:outline-none focus:ring-1 focus:ring-theme-color";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5"
      >
        <h2 className="text-lg font-semibold text-gray-900">編輯考古題</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              考古題名稱
            </label>
            <input
              required
              className={baseInputClass}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                課程名稱
              </label>
              <input
                required
                className={baseInputClass}
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                授課教授
              </label>
              <input
                required
                className={baseInputClass}
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                年份
              </label>
              <input
                required
                className={baseInputClass}
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </div>
            <div>
               <label className="block text-[0.9rem] font-medium text-slate-700">
                考試類別
              </label>
              <select
                required
                className={baseInputClass}
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as ExamType })}
              >
                <option value="" disabled>請選擇</option>
                {["期中考", "期末考", "小考"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-[0.9rem] font-medium text-slate-700">
              是否包含答案
            </label>
            <div className="mt-2 flex gap-4">
              {["沒有", "包含官方解", "包含非官方解"].map((type) => (
                <label key={type} className="inline-flex items-center gap-1 text-[0.9rem]">
                  <input
                    type="radio"
                    name="hasAnswers"
                    value={type}
                    checked={formData.hasAnswers === type}
                    onChange={() => setFormData({ ...formData, hasAnswers: type as AnswerType })}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              其他說明
            </label>
            <textarea
              className={`${baseInputClass} h-24 resize-none`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-[0.9rem] font-medium text-gray-700 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-theme-color px-3 py-2 text-[0.9rem] font-medium text-white shadow-sm hover:bg-[#3d7a69] focus:outline-none focus:ring-2 focus:ring-theme-color focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "儲存中..." : "儲存變更"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

