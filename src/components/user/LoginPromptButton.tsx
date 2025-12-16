"use client";

import { signIn } from "next-auth/react";

export function LoginPromptButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-full bg-theme-color px-6 py-2 text-[0.9rem] font-medium text-white shadow-sm hover:bg-[#3d7a69] focus:outline-none focus:ring-2 focus:ring-theme-color focus:ring-offset-2"
    >
      立即登入
    </button>
  );
}

