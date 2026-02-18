import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TikTok AI Video Blender - AI動画をかけあわせるツール",
  description:
    "TikTokでバズっているAI動画を2つ選んで、新しいブレンド動画を作成するツール。スプリットスクリーン、オーバーレイ、PiP、クロスフェードなど多彩なブレンドモード搭載。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
