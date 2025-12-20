"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type KeywordType = "course" | "professor";
type SortOption = "lightning" | "createdAt";

interface SearchPayload {
  keyword?: string;
  keywordType: KeywordType;
  yearStart?: number;
  yearEnd?: number;
  examTypes: string[];
  answerTypes: string[];
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface SearchResult {
  _id: string;
  title: string;
  courseName: string;
  instructor?: string;
  department?: string;
  semester?: string;
  examType?: string;
  hasAnswers?: string;
  lightning: number;
  createdAt?: string;
}

const examTypeOptions = ["期中考", "期末考", "小考"];
const answerTypeOptions = ["沒有", "包含官方解", "包含非官方解"];

function parseYearInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.match(/\d+/);
  if (!digits) return undefined;
  const parsed = parseInt(digits[0], 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildTagClass(isActive: boolean) {
  const base =
    "rounded-full border px-2 py-0.5 text-[0.9rem] transition-colors duration-150";
  const inactive =
    "border-slate-200 bg-slate-50 text-slate-600 hover:border-theme-color hover:text-theme-color";
  const active =
    "border-theme-color bg-theme-color/10 text-theme-color hover:bg-theme-color/20";
  return `${base} ${isActive ? active : inactive}`;
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [keywordType, setKeywordType] = useState<KeywordType>("course");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [selectedExamTypes, setSelectedExamTypes] = useState<string[]>([]);
  const [selectedAnswerTypes, setSelectedAnswerTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("lightning");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchPayload = useMemo<SearchPayload>(() => {
    const start = parseYearInput(yearStart);
    const end = parseYearInput(yearEnd);

    return {
      keyword: keyword.trim() ? keyword.trim() : undefined,
      keywordType,
      yearStart: start,
      yearEnd: end,
      examTypes: selectedExamTypes,
      answerTypes: selectedAnswerTypes,
      sortBy,
      sortOrder: "desc",
      page: 1,
      limit: 50,
    };
  }, [
    keyword,
    keywordType,
    yearStart,
    yearEnd,
    selectedExamTypes,
    selectedAnswerTypes,
    sortBy,
  ]);

  const payloadRef = useRef<SearchPayload>(searchPayload);

  useEffect(() => {
    payloadRef.current = searchPayload;
  }, [searchPayload]);

  const getYearValidationError = () => {
    const startTrim = yearStart.trim();
    const endTrim = yearEnd.trim();
    const startVal = parseYearInput(yearStart);
    const endVal = parseYearInput(yearEnd);

    const isOutOfRange = (value?: number) =>
      value !== undefined && (value < 90 || value > 150);

    if (startTrim && startVal === undefined) return "年份需為 90~150 的數字";
    if (endTrim && endVal === undefined) return "年份需為 90~150 的數字";
    if (isOutOfRange(startVal) || isOutOfRange(endVal)) {
      return "搜尋年份不合法";
    }
    if (
      typeof startVal === "number" &&
      typeof endVal === "number" &&
      startVal > endVal
    ) {
      return "開始年份不可大於結束年份";
    }
    return null;
  };

  const yearErrorMessage = useMemo(() => getYearValidationError(), [yearStart, yearEnd]);

  const performSearch = useCallback(async (payload: SearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/exams/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        exams: SearchResult[];
        total: number;
      };

      setResults(data.exams);
      setTotal(data.total);
      setHasSearched(true);
    } catch (err) {
      console.error("Failed to search exams:", err);
      setError("搜尋發生錯誤，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const yearError = getYearValidationError();
    if (yearError) {
      // setError(yearError);
      return;
    }
    void performSearch(payloadRef.current);
  }, [performSearch]);

  const handleSearch = useCallback(async () => {
    if (yearErrorMessage) {
      // setError(yearErrorMessage);
      return;
    }
    setError(null);
    await performSearch(payloadRef.current);
  }, [performSearch, yearErrorMessage]);

  const handleSortChange = (option: SortOption) => {
    if (option === sortBy) return;

    if (yearErrorMessage) {
      // setError(yearErrorMessage);
      return;
    }

    const nextPayload = { ...payloadRef.current, sortBy: option };
    setSortBy(option);
    payloadRef.current = nextPayload;
    void performSearch(nextPayload);
  };

  const toggleExamType = (value: string) => {
    setSelectedExamTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const toggleAnswerType = (value: string) => {
    setSelectedAnswerTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const resultSummary = hasSearched
    ? `共 ${total} 筆符合條件的考古題`
    : "請設定條件後搜尋考古題";

  const keywordPlaceholder =
    keywordType === "professor" ? "輸入教授姓名" : "輸入課程名稱";

  return (
    <div className="flex gap-6">
      <section className="w-80 shrink-0 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-[1.1rem] font-semibold text-slate-900">搜尋考古題</h1>
        <p className="mt-1 text-[0.9rem] text-slate-500">
          搜尋想要的考古題。
        </p>

        <form
          className="mt-4 space-y-4 text-[0.9rem]"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSearch();
          }}
        >
          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              關鍵字
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none ring-0 focus:border-theme-color"
              placeholder={keywordPlaceholder}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <div className="mt-2 flex gap-2 text-[0.9rem] text-slate-500">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="keywordType"
                  value="course"
                  checked={keywordType === "course"}
                  onChange={() => setKeywordType("course")}
                />
                <span>用課程名稱搜尋</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="keywordType"
                  value="professor"
                  checked={keywordType === "professor"}
                  onChange={() => setKeywordType("professor")}
                />
                <span>用教授名搜尋</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[0.9rem] font-medium text-slate-700">
              年份範圍
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none focus:border-theme-color"
                placeholder="98"
                value={yearStart}
                onChange={(event) => setYearStart(event.target.value)}
              />
              <span className="text-[0.9rem] text-slate-500">到</span>
              <input
                className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[0.9rem] outline-none focus:border-theme-color"
                placeholder="114"
                value={yearEnd}
                onChange={(event) => setYearEnd(event.target.value)}
              />
            </div>
            {/* {yearErrorMessage && (
              <p className="mt-1 text-[0.8rem] text-red-500">{yearErrorMessage}</p>
            )} */}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">
                考試類別
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {examTypeOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleExamType(tag)}
                    className={buildTagClass(selectedExamTypes.includes(tag))}
                    aria-pressed={selectedExamTypes.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.9rem] font-medium text-slate-700">
                是否包含答案
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {answerTypeOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleAnswerType(tag)}
                    className={buildTagClass(selectedAnswerTypes.includes(tag))}
                    aria-pressed={selectedAnswerTypes.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`mt-2 w-full rounded-lg px-3 py-1.5 text-[1rem] font-medium transition-colors border ${
              isLoading || !!yearErrorMessage
                ? "bg-slate-300 text-white border-slate-300 cursor-not-allowed pointer-events-none"
                : "bg-theme-color text-white border-theme-color hover:bg-[#3a7263]"
            }`}
            // Remove disabled attribute to prevent Safari from hiding background
            // We handle interaction blocking via CSS and logic
            disabled={false}
          >
            {isLoading ? "搜尋中..." : "搜尋"}
          </button>
        </form>
      </section>

      <section className="flex-1 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.1rem] font-semibold text-slate-900">搜尋結果</h2>
            <p className="mt-1 text-[0.9rem] text-slate-500">{resultSummary}</p>
          </div>
          <div className="flex items-center gap-2 text-[0.9rem] text-slate-500">
            <span className="text-slate-400">排序：</span>
            <button
              type="button"
              onClick={() => handleSortChange("lightning")}
              className={`rounded-full px-2 py-0.5 text-[0.9rem] ${
                sortBy === "lightning"
                  ? "bg-slate-100 font-medium text-slate-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              依閃電數
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("createdAt")}
              className={`rounded-full px-2 py-0.5 text-[0.9rem] ${
                sortBy === "createdAt"
                  ? "bg-slate-100 font-medium text-slate-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              依上傳時間
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-[0.9rem]">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.9rem] text-red-600">
              {error}
            </div>
          )}

          {!error && isLoading && (
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-6 text-center text-[0.9rem] text-slate-500">
              搜尋中，請稍候...
            </div>
          )}

          {!error && !isLoading && hasSearched && results.length === 0 && (
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-6 text-center text-[0.9rem] text-slate-500">
              沒有找到符合的考古題，試著調整搜尋條件。
            </div>
          )}

          {!error &&
            results.map((item) => (
              <article
                key={item._id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div>
                  <h3 className="text-[0.95rem] font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[0.9rem] text-slate-500">
                    課程：{item.courseName}
                    {item.instructor
                      ? ` ‧ ${item.instructor}教授`
                      : " ‧ 未提供授課教師"}
                  </p>
                  <p className="mt-0.5 text-[0.9rem] text-slate-500">
                    {item.department ? `科系：${item.department} · ` : ""}
                    {item.semester ? `${item.semester} 學年度 · ` : ""}
                    {item.examType ?? "類別未標註"}
                  </p>
                  <p className="mt-0.5 text-[0.9rem] text-slate-500">
                    解答：{item.hasAnswers ?? "未標註"} · 上傳時間：
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("zh-TW")
                      : "未知"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 text-[0.8rem]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFCB47]/10 px-2 py-0.5 text-[0.9rem] font-medium text-[#b28719]">
                    ⚡ {item.lightning}
                  </span>
                  <Link
                    href={`/exam/${item._id}`}
                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[0.8rem] text-slate-600 transition-colors hover:border-theme-color hover:text-theme-color"
                  >
                    查看詳細
                  </Link>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

