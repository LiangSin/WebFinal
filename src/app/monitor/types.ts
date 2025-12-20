export type MonitorRange = "today" | "3days" | "week" | "month" | "all";

export interface MonitorExamFile {
  _id?: string;
  type?: string;
  url?: string;
  name?: string;
  fileId?: string;
}

export interface MonitorExam {
  _id: string;
  title: string;
  courseName: string;
  instructor?: string;
  department?: string;
  semester?: string;
  examType?: string;
  hasAnswers?: string;
  description?: string;
  reportCount: number;
  lastReportedAt?: string | null;
  createdAt?: string | null;
  files?: MonitorExamFile[];
}

