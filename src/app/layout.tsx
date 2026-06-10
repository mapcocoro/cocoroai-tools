import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho_B1, IBM_Plex_Mono } from "next/font/google";
import SwRegister from "@/components/SwRegister";
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
  metadataBase: new URL("https://cocoroai-tools.pages.dev"), // ドメイン確定後に tools.cocoroai.co.jp へ
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "しごとの小道具 by ココロAI",
    url: "/",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og/site.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/site.png"],
  },
  title: {
    default: "しごとの小道具 by ココロAI | 無料で使える業務ミニツール集",
    template: "%s | しごとの小道具 by ココロAI",
  },
  description:
    "見積書・請求書・QRコード・写真圧縮・順番待ちボードなど、小さな会社とお店のための無料ミニツール集。登録不要・ブラウザだけで使えます。ココロＡＩ合同会社が運営。",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
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
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
