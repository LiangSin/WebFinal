"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function AuthButton() {
  const [status, setStatus] = useState<"loading" | "signedIn" | "signedOut">(
    "loading",
  );
  const [email, setEmail] = useState<string | null>(null);

  // 簡易版本：用 /api/auth/session 取得目前登入狀態
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          setStatus("signedOut");
          return;
        }
        const data = await res.json();
        if (data?.user?.email) {
          setEmail(data.user.email);
          setStatus("signedIn");
        } else {
          setStatus("signedOut");
        }
      } catch {
        setStatus("signedOut");
      }
    }

    fetchSession();
  }, []);

  if (status === "loading") {
    return (
      <button
        type="button"
        className="rounded-full border border-slate-300 px-4 py-1.5 text-[0.9rem] text-slate-500"
        disabled
      >
        讀取中…
      </button>
    );
  }

  if (status === "signedOut") {
    return (
      <button
        type="button"
        className="rounded-full border border-slate-300 px-4 py-1.5 text-[0.9rem] text-slate-700 hover:border-theme-color hover:text-theme-color"
        onClick={() => signIn("google")}
      >
        使用 g.ntu.edu.tw 登入
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[0.9rem]">
      <span className="text-slate-600">{email ?? "已登入"}</span>
      <button
        type="button"
        className="rounded-full border border-slate-300 px-3 py-1 text-[0.9rem] text-slate-500 hover:border-red-300 hover:text-red-500"
        onClick={() => signOut()}
      >
        登出
      </button>
    </div>
  );
}


