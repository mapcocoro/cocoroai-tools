import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho_B1, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const shippori = Shippori_Mincho_B1({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-shippori",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "しごとの小道具 by ココロAI | 無料で使える業務ミニツール集",
    template: "%s | しごとの小道具 by ココロAI",
  },
  description:
    "見積書・請求書・QRコード・写真圧縮・順番待ちボードなど、小さな会社とお店のための無料ミニツール集。登録不要・ブラウザだけで使えます。ココロＡＩ合同会社が運営。",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#005b7b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJp.variable} ${shippori.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
