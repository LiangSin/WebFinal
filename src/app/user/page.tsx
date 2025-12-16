import { getUserFolders } from "./actions";
import UserPageClient from "@/components/user/UserPageClient";
import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";
import { redirect } from "next/navigation";

export default async function UserPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">請先登入</h2>
        <p className="mt-2 max-w-sm text-[0.9rem] text-slate-500">
          您需要登入 G-Suite 信箱 (@g.ntu.edu.tw) 才能查看個人頁面、管理考古題與私人資料夾。
        </p>
        <div className="mt-6">
          {/* 這裡因為是 Server Component，不能直接用 onClick。
              AuthButton 是 Client Component，我們可以用它，或者簡單地提示使用者看右上角。
              為了使用者體驗，我們直接放一個 Client Component 的登入按鈕在這裡。
           */}
          <LoginPromptButton />
        </div>
      </div>
    );
  }

  const folders = await getUserFolders();

  return <UserPageClient initialFolders={folders} />;
}

// 簡單的 Client Component 用來觸發登入
import { LoginPromptButton } from "@/components/user/LoginPromptButton";
