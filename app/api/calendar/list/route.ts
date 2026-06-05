import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    // oauth2のクライアントを作成
    const oauth2Client = new google.auth.OAuth2();

    // 認証情報をセットする
    oauth2Client.setCredentials({ access_token: accessToken });

    // 認証情報をセットしたクライアントとバージョンの指定をしてカレンダークライアントを作成
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 現在時刻から、直近10件の予定を取得する
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({ events: res.data.items || [] });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status ===
        "number"
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Google Calendar の認証に失敗しました" },
        { status },
      );
    }

    console.error("Fetch Events Error:", error);
    return NextResponse.json(
      { error: "予定の取得に失敗しました" },
      { status: 500 },
    );
  }
}
