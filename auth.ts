import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
  callbacks: {
    // Googleから返ってきたトークンを処理する関数
    async jwt({ token, account }) {
      if (account) {
        // ログイン時に取得したカレンダー操作用のアクセストークンを保存
        token.accessToken = account.access_token;
      }
      return token;
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
