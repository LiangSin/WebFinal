"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/", label: "Trending⚡️" },
    { href: "/search", label: "搜尋" },
    { href: "/upload", label: "上傳考古題" },
    { href: "/user", label: "我的頁面" },
  ];

  return (
    <nav className="flex items-center gap-7 text-base">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`font-medium transition-colors ${
            isActive(item.href)
              ? "text-theme-color"
              : "text-slate-700 hover:text-theme-color"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

