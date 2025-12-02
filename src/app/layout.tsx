import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import logo from "../../assets/webFinal-logo.png";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthButton } from "@/components/auth/AuthButton";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Book",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        <AuthProvider>
          <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
                <Link href="/" className="flex items-center gap-4">
                  <Image
                    src={logo}
                    alt="Open Book Logo"
                    className="h-20 w-20 object-contain"
                    priority
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-2xl font-semibold text-slate-900">
                      Open Book
                    </span>
                    <span className="text-sm text-slate-500">
                      台大考古題分享平台 - Prototype
                    </span>
                  </div>
                </Link>
                <NavBar />
                <div className="flex items-center gap-3">
                  <AuthButton />
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-8 py-6">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
