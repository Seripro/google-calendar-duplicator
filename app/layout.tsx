import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react"; // ← 追加

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Google Calendar Duplicator",
  description: "Duplicate events to multiple dates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* SessionProvider で children を囲む */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
