"use client";

import { FormEvent, useRef, useState, ChangeEvent } from "react";
import { uploadExamAction } from "./actions";

type ExamType = "期中考" | "期末考" | "小考";
type AnswerType = "沒有" | "包含官方解" | "包含非官方解";
type YearType = "ROC" | "AD";

type UploadFilesState = {
  question: FileList | null;
  official: FileList | null;
  unofficial: FileList | null;
};

interface UploadFormState {
  title: string;
  course: string;
  professor: string;
  year: string;
  yearType: YearType;
  examType: ExamType | "";
  answerType: AnswerType | "";
  note: string;
}

type UploadFormErrors = Partial<Record<keyof UploadFormState, string>> & {
  files?: string;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const [form, setForm] = useState<UploadFormState>({
    title: "",
    course: "",
    professor: "",
    year: "",
    yearType: "ROC",
    examType: "",
    answerType: "",
    note: "",
  });

  const [errors, setErrors] = useState<UploadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState<UploadFilesState>({
    question: null,
    official: null,
    unofficial: null,
  });
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const questionInputRef = useRef<HTMLInputElement>(null);
  const officialInputRef = useRef<HTMLInputElement>(null);
  const unofficialInputRef = useRef<HTMLInputElement>(null);

  const inputRefMap: Record<
    keyof UploadFilesState,
    React.RefObject<HTMLInputElement | null>
  > = {
    question: questionInputRef,
    official: officialInputRef,
    unofficial: unofficialInputRef,
  };

  const mergeFileLists = (existing: FileList | null, incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return existing;
    const dt = new DataTransfer();
    if (existing) {
      Array.from(existing).forEach((file) => dt.items.add(file));
    }
    Array.from(incoming).forEach((file) => dt.items.add(file));
    return dt.files;
  };

  const resetFiles = (type: keyof UploadFilesState) => {
    setFiles((prev) => {
      const updated = { ...prev, [type]: null };
      validateFileSizes(updated);

      const ref = inputRefMap[type];
      if (ref?.current) {
        ref.current.value = "";
        ref.current.files = new DataTransfer().files;
      }
      return updated;
    });
  };

  const getFileSizeError = (fileState: UploadFilesState) => {
    for (const list of Object.values(fileState)) {
      if (!list) continue;
      for (const file of Array.from(list)) {
        if (file.size > MAX_FILE_SIZE) {
          return `檔案「${file.name}」超過 ${MAX_FILE_SIZE_MB}MB，請重新選擇`;
        }
      }
    }
    return null;
  };

  const validateFileSizes = (nextFiles: UploadFilesState) => {
    const message = getFileSizeError(nextFiles);
    setFileSizeError(message);
    return !message;
  };

  const handleFileChange =
    (type: keyof UploadFilesState) => (e: ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;
      setFiles((prev) => {
        const merged = mergeFileLists(prev[type], fileList);
        const updated = { ...prev, [type]: merged };
        validateFileSizes(updated);

        // Keep the actual input.files in sync so form submission sends all files
        const ref = inputRefMap[type];
        if (ref?.current) {
          const syncDT = new DataTransfer();
          Array.from(merged ?? []).forEach((file) => syncDT.items.add(file));
          ref.current.files = syncDT.files;
        }

        return updated;
      });
    };

  const handleSubmit = (e: FormEvent) => {
    if (!validateFileSizes(files)) {
      e.preventDefault();
      return;
    }

    const newErrors: UploadFormErrors = {};

    if (!form.title.trim()) newErrors.title = "此欄位為必填";
    if (!form.course.trim()) newErrors.course = "此欄位為必填";
    if (!form.professor.trim()) newErrors.professor = "此欄位為必填";
    if (!form.year.trim()) newErrors.year = "此欄位為必填";
    if (!form.examType) newErrors.examType = "請選擇一個考試類別";
    if (!form.answerType) newErrors.answerType = "請選擇是否包含答案";

    // Validate AD year lower bound
    const yearNum = parseInt(form.year, 10);
    if (form.yearType === "AD") {
      if (isNaN(yearNum) || yearNum < 1911) {
        newErrors.year = "年份錯誤！";
      }
    }

    const hasAnyFile =
      (files.question && files.question.length > 0) ||
      (files.official && files.official.length > 0) ||
      (files.unofficial && files.unofficial.length > 0);

    if (!hasAnyFile) {
      newErrors.files = "三個區塊中至少需上傳一個檔案";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      // Scroll to top or error?
    } else {
      // Allow submission
      setIsSubmitting(true);
    }
  };

  const baseInputClass =
    "mt-1 w-full rounded-md border bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none ring-0 focus:border-theme-color";

  const renderFileList = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return "未選擇檔案";
    return Array.from(fileList).map((f) => f.name).join(", ");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <header className="mb-4">
        <h1 className="text-[1.1rem] font-semibold text-slate-900">
          上傳新的考古題
        </h1>
        <p className="mt-1 text-[0.9rem] text-slate-500">
          請填寫完整資訊以協助他人搜尋。
        </p>
      </header>

      <form
        className="text-[0.9rem]"
        onSubmit={handleSubmit}
        action={uploadExamAction}
        noValidate
      >
        <section className="space-y-4">
          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              考古題名稱<span className="ml-1 text-red-500">*</span>
            </label>
            <input
              name="title"
              className={`${baseInputClass} ${
                errors.title ? "border-red-500" : "border-slate-200"
              }`}
              placeholder="例：計算機結構 第二次期中考"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && (
              <p className="mt-1 text-[0.9rem] text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                課程名稱<span className="ml-1 text-red-500">*</span>
              </label>
              <input
                name="course"
                className={`${baseInputClass} ${
                  errors.course ? "border-red-500" : "border-slate-200"
                }`}
                placeholder="課程全名"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
              />
              {errors.course && (
                <p className="mt-1 text-[0.9rem] text-red-500">
                  {errors.course}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                授課教授<span className="ml-1 text-red-500">*</span>
              </label>
              <div className="flex w-full flex-nowrap items-center  gap-1">
                <input
                  name="professor"
                  className={`${baseInputClass.replace("w-full", "flex-1")} ${
                    errors.professor ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="輸入教授姓名"
                  value={form.professor}
                  onChange={(e) =>
                    setForm({ ...form, professor: e.target.value })
                  }
                />
                <span className="w-10 shrink-0 text-left text-[0.9rem] text-slate-500 whitespace-nowrap">
                  教授
                </span>
              </div>
              {errors.professor && (
                <p className="mt-1 text-[0.9rem] text-red-500">
                  {errors.professor}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[0.9rem] font-medium text-slate-700">
                  年份<span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 text-[0.9rem] text-slate-500">
                  {[
                    { value: "ROC", label: "民國" },
                    { value: "AD", label: "西元" },
                  ].map((option) => (
                    <label key={option.value} className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="yearType"
                        value={option.value}
                        checked={form.yearType === option.value}
                        onChange={() =>
                          setForm({ ...form, yearType: option.value as YearType })
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <input
                name="year"
                className={`${baseInputClass} ${
                  errors.year ? "border-red-500" : "border-slate-200"
                }`}
                placeholder={form.yearType === "AD" ? "例：2024" : "例：113"}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
              {errors.year && (
                <p className="mt-1 text-[0.9rem] text-red-500">{errors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                考試類別<span className="ml-1 text-red-500">*</span>
              </label>
              <div
                className={`mt-1 flex gap-2 rounded-md border bg-slate-50 px-2 py-1.5 ${errors.examType ? "border-red-500" : "border-slate-200"
                  }`}
              >
                {["期中考", "期末考", "小考"].map((type) => (
                  <label
                    key={type}
                    className="inline-flex items-center gap-1 text-[0.9rem]"
                  >
                    <input
                      type="radio"
                      name="examType"
                      value={type}
                      checked={form.examType === type}
                      onChange={() =>
                        setForm({
                          ...form,
                          examType: type as ExamType,
                        })
                      }
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {errors.examType && (
                <p className="mt-1 text-[0.9rem] text-red-500">
                  {errors.examType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[0.9rem] font-medium text-slate-700">
                是否包含答案<span className="ml-1 text-red-500">*</span>
              </label>
              <div
                className={`mt-1 flex gap-2 rounded-md border bg-slate-50 px-2 py-1.5 ${errors.answerType ? "border-red-500" : "border-slate-200"
                  }`}
              >
                {["沒有", "包含官方解", "包含非官方解"].map((type) => (
                  <label
                    key={type}
                    className="inline-flex items-center gap-1 text-[0.9rem]"
                  >
                    <input
                      type="radio"
                      name="answerType"
                      value={type}
                      checked={form.answerType === type}
                      onChange={() =>
                        setForm({
                          ...form,
                          answerType: type as AnswerType,
                        })
                      }
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {errors.answerType && (
                <p className="mt-1 text-[0.9rem] text-red-500">
                  {errors.answerType}
                </p>
              )}
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">
                上傳檔案（三選一或以上）
              </p>
              <p className="mt-1 text-[0.9rem] text-slate-500">
                可以上傳 PDF 或圖片，每一區都可多檔，單檔大小上限 {MAX_FILE_SIZE_MB}MB。
              </p>
              {errors.files && (
                <p className="mt-1 text-[0.9rem] text-red-500">{errors.files}</p>
              )}
              {fileSizeError && (
                <p className="mt-1 text-[0.9rem] text-red-500">{fileSizeError}</p>
              )}
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              name="file_question"
              multiple
              className="hidden"
              ref={questionInputRef}
              onChange={handleFileChange("question")}
            />
            <input
              type="file"
              name="file_official"
              multiple
              className="hidden"
              ref={officialInputRef}
              onChange={handleFileChange("official")}
            />
            <input
              type="file"
              name="file_unofficial"
              multiple
              className="hidden"
              ref={unofficialInputRef}
              onChange={handleFileChange("unofficial")}
            />

            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "file-question", label: "題目檔案", ref: questionInputRef, fileList: files.question },
                { id: "file-official", label: "官方解答", ref: officialInputRef, fileList: files.official },
                { id: "file-unofficial", label: "非官方解答", ref: unofficialInputRef, fileList: files.unofficial },
              ].map((group) => (
                <div
                  key={group.id}
                  className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3"
                >
                  <p className="text-[0.9rem] font-medium text-slate-700">
                    {group.label}
                  </p>
                  <p className="mt-1 text-[0.9rem] text-slate-500">
                    可上傳多個檔案，支援 PDF / 圖片。
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => group.ref.current?.click()}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[0.9rem] text-theme-color hover:border-theme-color hover:text-theme-color"
                    >
                      {group.fileList && group.fileList.length > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-theme-color">+</span>
                          <span className="text-theme-color">新增</span>
                        </span>
                      ) : (
                        <span className="text-theme-color">選擇檔案</span>
                      )}
                    </button>
                    {group.fileList && group.fileList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => resetFiles(group.id.replace("file-", "") as keyof UploadFilesState)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[0.9rem] text-slate-500 hover:border-red-400 hover:text-red-500"
                      >
                        移除全部
                      </button>
                    )}
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.9rem] text-slate-400">
                    {renderFileList(group.fileList)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              其他說明（非必填）
            </label>
            <textarea
              name="note"
              className={`${baseInputClass} h-24 resize-none border-slate-200`}
              placeholder="例：我的字很醜請見諒、這份很難..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !!fileSizeError}
              className={`w-full rounded-md px-3 py-2 text-[0.9rem] font-medium text-white ${
                isSubmitting || fileSizeError
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-theme-color hover:bg-[#3a7263]"
              }`}
            >
              {isSubmitting ? "上傳中..." : "建立考古題"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
