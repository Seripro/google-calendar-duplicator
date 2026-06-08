"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/duplicate");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          G-Cal Duplicator
        </h2>
        <p className="text-gray-600 mb-8">
          Googleカレンダーの予定を複数の日付に一括複製します。
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/duplicate" })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition"
        >
          Googleアカウントでログイン
        </button>
      </div>
    </main>
  );
}
