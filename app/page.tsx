"use client"; // クライアントサイドでの状態管理（useStateなど）を使用するため必須

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";

// Google Calendar のイベント型定義
interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
}

export default function Home() {
  const { data: session, status } = useSession();

  // 状態管理
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [targetDates, setTargetDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [value, setValue] = useState<DateObject[]>([]);

  // ログイン成功時に直近の予定を取得
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/calendar/list")
        .then((res) => res.json())
        .then((data) => {
          if (data.events) setEvents(data.events);
        })
        .catch((err) => console.error(err));
    }
  }, [status]);

  // 複製先の日付を配列に追加する処理
  const handleAddDate = () => {
    if (value.length !== 0) {
      const newDates = value.map((d) => `${d.year}-${d.month.number}-${d.day}`);
      setTargetDates(newDates.sort()); // 日付順になる
    }
  };

  // 選択した日付を削除する処理
  const handleRemoveDate = (dateToRemove: string) => {
    setTargetDates(targetDates.filter((date) => date !== dateToRemove));
  };

  // 複製処理を実行（APIを叩く）
  const handleDuplicate = async () => {
    if (!selectedEventId || targetDates.length === 0) {
      setMessage("予定と複製先の日付を1つ以上選択してください。");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/calendar/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          targetDates: targetDates,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`成功！ ${data.events.length}個の予定を複製しました。`);
        setTargetDates([]); // 選択をクリア
        setValue([]);
      } else {
        setMessage(`エラー: ${data.error}`);
      }
    } catch (err) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 md:p-24 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-end items-center mb-6">
          {session && (
            <button
              onClick={() => signOut()}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition"
            >
              ログアウト
            </button>
          )}
        </div>

        {!session ? (
          /* ---------- ログイン前 ---------- */
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">
              Googleカレンダーの予定を複数の日付に一括複製します。
            </p>
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition"
            >
              Googleアカウントでログイン
            </button>
          </div>
        ) : (
          /* ---------- ログイン後 ---------- */
          <div className="space-y-6">
            {/* 1. 複製元の予定選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ① 複製したい予定を選択
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full border rounded-lg p-2.5 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- 予定を選択してください --</option>
                {events.map((event) => {
                  const date = event.start.dateTime
                    ? new Date(event.start.dateTime).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : `${event.start.date} (終日)`;
                  return (
                    <option key={event.id} value={event.id}>
                      {date} - {event.summary || "(タイトルなし)"}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. 複製先の日付選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ② 複製先の日付を追加（複数可）
              </label>
              <div>
                <DatePicker value={value} onChange={setValue} multiple={true} />
                <button onClick={handleAddDate}>追加</button>
              </div>

              {/* 選択された日付のバッジリスト */}
              {targetDates.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                  {targetDates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-sm font-medium"
                    >
                      {date}
                      <button
                        onClick={() => handleRemoveDate(date)}
                        className="text-blue-400 hover:text-blue-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. 実行セクション */}
            <div className="pt-4 border-t">
              <button
                onClick={handleDuplicate}
                disabled={loading}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition shadow ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "複製処理中..." : "カレンダーに一括複製する"}
              </button>
            </div>

            {/* 結果メッセージ表示 */}
            {message && (
              <div
                className={`p-4 rounded-lg text-center font-medium ${
                  message.startsWith("成功")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
