"use client";

import { FormEvent, useState } from "react";

type ExamType = "期中考" | "期末考" | "小考";
type AnswerType = "沒有" | "包含官方解" | "包含非官方解";

interface UploadFormState {
  title: string;
  course: string;
  professor: string;
  year: string;
  examType: ExamType | "";
  answerType: AnswerType | "";
  note: string;
}

type UploadFormErrors = Partial<Record<keyof UploadFormState, string>> & {
  files?: string;
};

export default function UploadPage() {
  const [form, setForm] = useState<UploadFormState>({
    title: "",
    course: "",
    professor: "",
    year: "",
    examType: "",
    answerType: "",
    note: "",
  });

  const [errors, setErrors] = useState<UploadFormErrors>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: UploadFormErrors = {};

    if (!form.title.trim()) newErrors.title = "此欄位為必填";
    if (!form.course.trim()) newErrors.course = "此欄位為必填";
    if (!form.professor.trim()) newErrors.professor = "此欄位為必填";
    if (!form.year.trim()) newErrors.year = "此欄位為必填";
    if (!form.examType) newErrors.examType = "請選擇一個考試類別";
    if (!form.answerType) newErrors.answerType = "請選擇是否包含答案";

    const hasAnyFile =
      document.getElementById("file-question") ||
      document.getElementById("file-official") ||
      document.getElementById("file-unofficial");

    if (!hasAnyFile) {
      newErrors.files = "三個區塊中至少需上傳一個檔案（僅示意，尚未連接實際檔案系統）";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("這裡之後會送出表單並上傳檔案，目前僅為 prototype 示意。");
    }
  };

  const baseInputClass =
    "mt-1 w-full rounded-md border bg-slate-50 px-2 py-1.5 text-xs outline-none ring-0 focus:border-theme-color";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <header className="mb-4">
        <h1 className="text-[1.1rem] font-semibold text-slate-900">
          上傳新的考古題
        </h1>
        <p className="mt-1 text-[0.9rem] text-slate-500">
          目前僅做表單與版面示意，不會真的上傳檔案或建立資料。
        </p>
      </header>

      <form
        className="text-xs"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="space-y-4">
          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              考古題名稱<span className="ml-1 text-red-500">*</span>
            </label>
            <input
              className={`${baseInputClass} ${errors.title ? "border-red-500" : "border-slate-200"
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
                className={`${baseInputClass} ${errors.course ? "border-red-500" : "border-slate-200"
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
                  className={`${baseInputClass.replace("w-full", "flex-1")} ${errors.professor ? "border-red-500" : "border-slate-200"
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
              <label className="block text-[0.9rem] font-medium text-slate-700">
                年份<span className="ml-1 text-red-500">*</span>
              </label>
              <input
                className={`${baseInputClass} ${errors.year ? "border-red-500" : "border-slate-200"
                  }`}
                placeholder="例：113"
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
                可以從電腦本機或 Google Drive 上傳 PDF 或圖片，每一區都可多檔。實作時會串接實際雲端儲存。
              </p>
              {errors.files && (
                <p className="mt-1 text-[0.9rem] text-red-500">{errors.files}</p>
              )}
            </div>

            {[
              { id: "file-question", label: "題目檔案" },
              { id: "file-official", label: "官方解答" },
              { id: "file-unofficial", label: "非官方解答" },
            ].map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3"
              >
                <p className="text-[0.9rem] font-medium text-slate-700">
                  {group.label}
                </p>
                <p className="mt-1 text-[0.9rem] text-slate-500">
                  可上傳多個檔案，支援 PDF / 圖片。Prototype
                  目前不會真的上傳，只展示功能入口位置。
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    id={group.id}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[0.9rem] text-slate-700 hover:border-theme-color hover:text-theme-color"
                  >
                    選擇本機檔案
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[0.9rem] text-slate-700 hover:border-theme-color hover:text-theme-color"
                  >
                    從 Google Drive 選擇
                  </button>
                </div>
                <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.9rem] text-slate-400">
                  這裡之後會顯示已選擇檔案列表（目前為示意）
                </div>
              </div>
            ))}
          </section>

          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              其他說明（非必填）
            </label>
            <textarea
              className={`${baseInputClass} h-24 resize-none border-slate-200`}
              placeholder="例：我的字很醜請見諒、這份很難..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-md bg-theme-color px-3 py-2 text-xs font-medium text-white hover:bg-[#3a7263]"
            >
              建立考古題（目前僅驗證必填欄位）
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}


