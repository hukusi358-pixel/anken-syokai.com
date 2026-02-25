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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="antialiased min-h-screen overscroll-none">
        {children}
      </body>
    </html>
  );
}
