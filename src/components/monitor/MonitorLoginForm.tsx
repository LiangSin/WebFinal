"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/monitor/actions";

export default function MonitorLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await adminLogin(username.trim(), password);
        if (result.success) {
          router.refresh();
          return;
        }
        setError(result.error ?? "登入失敗");
      } catch (err) {
        console.error("admin login error:", err);
        setError("登入失敗，請稍後再試");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">後台登入</h1>
      <p className="mt-1 text-sm text-slate-500">
        請輸入管理者帳號與密碼進入監控頁面。
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700">帳號</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-color"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="輸入帳號"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">密碼</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-color"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="輸入密碼"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-theme-color py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a7263] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "登入中..." : "登入後台"}
        </button>
      </form>
    </div>
  );
}

