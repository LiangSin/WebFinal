import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Book（Prototype）",
  description: "Open Book – NTU Exam Archive Sharing Platform (Prototype UI only)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#498E7B] text-white shadow-sm">
                  <span className="text-lg font-semibold">O</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-900">
                    Open Book
                  </span>
                  <span className="text-xs text-slate-500">
                    台大考古題分享平台 Prototype · 介面預覽
                  </span>
                </div>
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-[#498E7B]"
                >
                  Trending⚡️
                </Link>
                <Link
                  href="/search"
                  className="text-slate-700 hover:text-[#498E7B]"
                >
                  搜尋
                </Link>
                <Link
                  href="/upload"
                  className="text-slate-700 hover:text-[#498E7B]"
                >
                  上傳考古題
                </Link>
                <Link
                  href="/user"
                  className="text-slate-700 hover:text-[#498E7B]"
                >
                  我的頁面
                </Link>
              </nav>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs text-slate-500"
                  disabled
                >
                  之後會在這裡顯示登入（g.ntu.edu.tw）
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
