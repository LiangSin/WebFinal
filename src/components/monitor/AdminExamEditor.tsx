"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addExamFileAdmin,
  deleteExamAdmin,
  replaceExamFileAdmin,
  removeExamFileAdmin,
  updateExamAdmin,
} from "@/app/monitor/actions";
import { MonitorExam, MonitorExamFile } from "@/app/monitor/types";

interface AdminExamEditorProps {
  exam: MonitorExam;
}

const EXAM_TYPE_OPTIONS = ["期中考", "期末考", "小考"];
const ANSWER_TYPE_OPTIONS = ["沒有", "包含官方解", "包含非官方解"];
const FILE_GROUPS = [
  { key: "question", label: "題目檔案" },
  { key: "official", label: "官方解答" },
  { key: "unofficial", label: "非官方解答" },
] as const;

export default function AdminExamEditor({ exam }: AdminExamEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionState, setActionState] = useState<"idle" | "saving" | "deleting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [files, setFiles] = useState<MonitorExamFile[]>(exam.files || []);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({
    title: exam.title || "",
    courseName: exam.courseName || "",
    instructor: exam.instructor || "",
    department: exam.department || "",
    semester: exam.semester || "",
    examType: exam.examType || "",
    hasAnswers: exam.hasAnswers || "",
    description: exam.description || "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setActionState("saving");
    setFeedback("儲存中...");
    startTransition(async () => {
      try {
        const updated = await updateExamAdmin(exam._id, formState);
        if (updated?.files) {
          setFiles(updated.files);
        }
        setActionState("success");
        setFeedback("已儲存，返回管理頁面...");
        router.push("/monitor?updated=" + Date.now());
      } catch (error) {
        console.error("Failed to save exam", error);
        setActionState("error");
        setFeedback("儲存失敗，請稍後再試。");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("確定刪除此考古題嗎？刪除後無法恢復。")) return;
    setActionState("deleting");
    setFeedback("刪除中...");
    startTransition(async () => {
      try {
        await deleteExamAdmin(exam._id);
        setActionState("success");
        setFeedback("已刪除，返回管理頁面...");
        router.push("/monitor?deleted=" + Date.now());
      } catch (error) {
        console.error("Failed to delete exam", error);
        setActionState("error");
        setFeedback("刪除失敗，請稍後再試。");
      }
    });
  };

  const handleReplaceFile = (fileEntryId?: string, file?: File | null) => {
    if (!fileEntryId || !file) return;
    setFileStatus("更新檔案中...");
    const data = new FormData();
    data.append("examId", exam._id);
    data.append("fileEntryId", fileEntryId);
    data.append("file", file);
    startTransition(async () => {
      try {
        const updated = await replaceExamFileAdmin(data);
        if (updated?.files) {
          setFiles(updated.files);
        }
        setFileStatus("檔案已更新。");
      } catch (error) {
        console.error("Failed to replace file", error);
        setFileStatus("更新檔案失敗，請再試一次。");
      }
    });
  };

  const handleAddFile = (type: string, file?: File | null) => {
    if (!file || !type) return;
    setFileStatus("新增檔案中...");
    const data = new FormData();
    data.append("examId", exam._id);
    data.append("fileType", type);
    data.append("file", file);
    startTransition(async () => {
      try {
        const updated = await addExamFileAdmin(data);
        if (updated?.files) {
          setFiles(updated.files);
        }
        setFileStatus("檔案已新增。");
      } catch (error) {
        console.error("Failed to add file", error);
        setFileStatus("新增檔案失敗，請再試一次。");
      }
    });
  };

  const handleRemoveFile = (fileEntryId?: string) => {
    if (!fileEntryId) return;
    if (!confirm("確定要刪除此檔案嗎？")) return;
    setFileStatus("刪除檔案中...");
    startTransition(async () => {
      try {
        const updated = await removeExamFileAdmin(exam._id, fileEntryId);
        if (updated?.files) {
          setFiles(updated.files);
        }
        setFileStatus("檔案已刪除。");
      } catch (error) {
        console.error("Failed to delete file", error);
        setFileStatus("刪除檔案失敗，請再試一次。");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">ID: {exam._id}</p>
          <h1 className="text-2xl font-semibold text-slate-900">編輯考古題</h1>
          <p className="text-sm text-slate-500">
            上傳時間：{exam.createdAt ? new Date(exam.createdAt).toLocaleString("zh-TW") : "未知"}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-theme-color hover:underline"
        >
          返回列表
        </button>
      </div>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <LabeledInput
          label="標題"
          name="title"
          value={formState.title}
          onChange={handleChange}
          required
        />
        <LabeledInput
          label="課程名稱"
          name="courseName"
          value={formState.courseName}
          onChange={handleChange}
          required
        />
        <LabeledInput
          label="授課老師"
          name="instructor"
          value={formState.instructor}
          onChange={handleChange}
        />
        <LabeledInput
          label="科系/單位"
          name="department"
          value={formState.department}
          onChange={handleChange}
        />
        <LabeledInput
          label="學年度／學期"
          name="semester"
          value={formState.semester}
          onChange={handleChange}
        />
        <div>
          <p className="text-sm font-medium text-slate-700">考試類型</p>
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {EXAM_TYPE_OPTIONS.map((type) => (
              <label key={type} className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="admin-exam-type"
                  value={type}
                  checked={formState.examType === type}
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, examType: type }))
                  }
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">是否有解答</p>
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {ANSWER_TYPE_OPTIONS.map((type) => (
              <label key={type} className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="admin-answer-type"
                  value={type}
                  checked={formState.hasAnswers === type}
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, hasAnswers: type }))
                  }
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">說明</label>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-color"
            rows={4}
          />
        </div>

        <div className="sm:col-span-2 mt-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">檔案管理</h2>
          {FILE_GROUPS.map((group) => {
            const groupFiles = files.filter((f) => f.type === group.key);
            return (
              <div key={group.key} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{group.label}</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-theme-color hover:text-theme-color">
                    新增檔案
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        handleAddFile(group.key, file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {groupFiles.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">尚未上傳檔案</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {groupFiles.map((file) => (
                      <li
                        key={file._id || file.url || file.name}
                        className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {file.name || "未命名檔案"}
                            </span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-theme-color hover:underline"
                            >
                              查看檔案
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-theme-color hover:text-theme-color">
                              更新
                              <input
                                type="file"
                                className="hidden"
                                onChange={(event) => {
                                  const nextFile = event.target.files?.[0] || null;
                                  handleReplaceFile(file._id, nextFile);
                                  event.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file._id)}
                              className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="sm:col-span-2 flex flex-wrap justify-between gap-3 pt-4">
          <button
            type="button"
          onClick={handleDelete}
            disabled={isPending || actionState === "saving" || actionState === "deleting"}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed"
          >
            刪除此考古題
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/monitor")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending || actionState === "saving" || actionState === "deleting"}
              className="rounded-lg bg-theme-color px-4 py-2 text-sm font-medium text-white hover:bg-[#3a7263] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {actionState === "saving"
                ? "儲存中..."
                : actionState === "deleting"
                ? "處理中..."
                : "儲存變更"}
            </button>
          </div>
        </div>
      </form>
      {feedback && (
        <p className="mt-4 text-sm text-slate-500" role="status">
          {feedback}
        </p>
      )}
      {fileStatus && (
        <p className="mt-2 text-sm text-slate-500" role="status">
          {fileStatus}
        </p>
      )}
    </div>
  );
}

interface LabeledInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function LabeledInput({
  label,
  name,
  value,
  onChange,
  required,
}: LabeledInputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-color"
      />
    </div>
  );
}

