import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// このファイルがあることで内部的に以下のエンドポイントが作成されるらしい。自動すぎる。
// GET /api/auth/session
// POST /api/auth/signin (または GET /api/auth/signin)
// POST /api/auth/signout
// GET/POST /api/auth/callback/google
// GET /api/auth/providers
