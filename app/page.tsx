import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  // サーバー側で現在のログイン状態（セッション）を取得します
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Google Calendar Duplicator
        </h1>

        {session ? (
          /* ---------- ログインしている時の表示 ---------- */
          <div className="space-y-4">
            <p className="text-gray-600">
              こんにちは、
              <span className="font-semibold">{session.user?.name}</span> さん！
            </p>
            {/* ログアウトボタン */}
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        ) : (
          /* ---------- ログインしていない時の表示 ---------- */
          <div className="space-y-4">
            <p className="text-gray-600">
              予定を複製するにはログインしてください。
            </p>
            {/* ログインボタン */}
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Googleでログイン
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
