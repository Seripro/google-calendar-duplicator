import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    // 1. ユーザーのセッション（ログイン情報）とアクセストークンを取得
    const session = await auth();
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    // 2. フロントエンドから送られてきたデータを受け取る
    const { eventId, targetDates } = await req.json();
    // eventId: 複製元の予定ID (例: "abc123xyz...")
    // targetDates: 複製先の日付配列 (例: ["2026-06-10", "2026-06-11"])

    if (!eventId || !targetDates || targetDates.length === 0) {
      return NextResponse.json(
        { error: "必要なデータが足りません" },
        { status: 400 },
      );
    }

    // 3. Google Calendar APIの初期化
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 4. 複製元の予定の詳細を取得する
    const originalEventRes = await calendar.events.get({
      calendarId: "primary", // "primary" はログインユーザーのメインカレンダーを指します
      eventId: eventId,
    });
    const original = originalEventRes.data;

    // 5. 指定された日付の数だけループして、新しい予定を作成（複製）する
    const createdEvents = [];

    for (const dateStr of targetDates) {
      // dateStr は "YYYY-MM-DD" 形式を想定
      // 元の予定のデータから、必要な項目だけを抽出して新しい予定のベースを作る
      const newEvent = {
        summary: original.summary,
        description: original.description,
        location: original.location,
        colorId: original.colorId,
        start: { ...original.start },
        end: { ...original.end },
      };

      // 終日予定か時間指定予定かで、日付の書き換え方を分岐させる
      if (newEvent.start?.date) {
        // 【終日予定の場合】
        newEvent.start.date = dateStr;
        // 終日予定の終了日は「翌日」を指定するルールがあるため、+1日計算する
        const endDate = new Date(dateStr);
        endDate.setDate(endDate.getDate() + 1);
        newEvent.end.date = endDate.toISOString().split("T")[0];
      } else if (newEvent.start?.dateTime && newEvent.end?.dateTime) {
        // 【時間指定予定の場合】
        // 元の予定の「時間部分（T以降）」を抽出して、新しい日付とガッチャンコする
        const startTime = newEvent.start.dateTime.split("T")[1];
        const endTime = newEvent.end.dateTime.split("T")[1];
        newEvent.start.dateTime = `${dateStr}T${startTime}`;
        newEvent.end.dateTime = `${dateStr}T${endTime}`;
      }

      // 実際にカレンダーに予定を挿入（書き込み）
      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: newEvent,
      });
      createdEvents.push(res.data);
    }

    // 6. 成功したら、作成した予定のデータをフロントエンドに返す
    return NextResponse.json({ success: true, events: createdEvents });
  } catch (error) {
    console.error("Calendar API Error:", error);
    return NextResponse.json(
      { error: "カレンダーの操作に失敗しました" },
      { status: 500 },
    );
  }
}
