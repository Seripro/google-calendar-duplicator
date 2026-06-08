"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/duplicate", label: "予定を複製" },
  { href: "/add-schedule", label: "新規予定" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">G-Cal Duplicator</h1>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition"
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
