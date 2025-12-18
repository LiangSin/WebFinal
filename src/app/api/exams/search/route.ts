import { NextResponse } from "next/server";
import {
  searchExams,
  SearchExamParams,
  SearchExamResult,
} from "@/lib/db/operations";

export const dynamic = "force-dynamic";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item)))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const digits = value.match(/\d+/);
    if (!digits || digits.length === 0) return undefined;
    const parsed = parseInt(digits[0], 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function parseKeywordType(value: unknown): "course" | "professor" {
  return value === "professor" ? "professor" : "course";
}

function parseSortField(value: unknown): "lightning" | "createdAt" {
  return value === "createdAt" ? "createdAt" : "lightning";
}

function parseSortOrder(value: unknown): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function sanitizePayload(data: Partial<SearchExamParams>): SearchExamParams {
  return {
    keyword: typeof data.keyword === "string" ? data.keyword : undefined,
    keywordType: parseKeywordType(data.keywordType),
    yearStart: toOptionalNumber(data.yearStart),
    yearEnd: toOptionalNumber(data.yearEnd),
    departments: toStringArray(data.departments),
    examTypes: toStringArray(data.examTypes),
    answerTypes: toStringArray(data.answerTypes),
    sortBy: parseSortField(data.sortBy),
    sortOrder: parseSortOrder(data.sortOrder),
    page: typeof data.page === "number" ? data.page : undefined,
    limit: typeof data.limit === "number" ? data.limit : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SearchExamParams>;
    const payload = sanitizePayload(body);
    const { exams, total } = await searchExams(payload);

    return NextResponse.json<{ exams: SearchExamResult[]; total: number }>({
      exams,
      total,
    });
  } catch (error) {
    console.error("Error searching exams:", error);
    return NextResponse.json(
      { error: "搜尋失敗，請稍後再試。" },
      { status: 500 }
    );
  }
}

