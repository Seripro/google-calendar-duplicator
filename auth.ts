// Google の access_token は短時間で期限切れになる。
// 期限切れだと Google API が使えない。
// 一方 refresh_token を使えばユーザーの再操作なしに新しい access_token を取得できる。

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

// 期限切れの Google のアクセストークンをリフレッシュトークンで更新する関数。
// トークン更新に失敗したらエラーフラグを付けたまま既存トークンを返す。
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID ?? "",
        client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh Google access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // ここでカレンダーの操作権限（スコープ）を要求します
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  //  JWT（セッショントークン）を作る／更新する処理。
  //  Sign-in 時の初期保存と、既存トークンの有効期限チェック・リフレッシュを行う。
  // セッション取得時にコールバックは呼ばれて、トークンが切れてたら更新する
  callbacks: {
    // Googleから返ってきたトークンを処理する関数
    async jwt({ token, account }) {
      if (account) {
        // ログイン時に取得したカレンダー操作用のアクセストークンを保存
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined;
        return token;
      }

      // トークンの期限がある　かつ　期限切れでない場合
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    // アプリ内でセッション情報を呼び出すときの処理
    async session({ session, token }) {
      // APIルート（バックエンド）でカレンダーAPIを叩くために、
      // セッションオブジェクトにアクセストークンを付与しておきます
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
