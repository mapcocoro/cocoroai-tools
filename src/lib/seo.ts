import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, type ToolMeta } from "./tools";

/** ツールページ用のmetadataを生成 */
export function toolMetadata(tool: ToolMeta): Metadata {
  const url = `${SITE_URL}/tools/${tool.id}/`;
  return {
    title: tool.seoTitle,
    description: tool.description,
    manifest: `/manifests/${tool.id}.webmanifest`,
    alternates: { canonical: url },
    openGraph: {
      title: `${tool.name} | ${SITE_NAME}`,
      description: tool.description,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "website",
      images: [{ url: `/og/${tool.id}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | ${SITE_NAME}`,
      description: tool.description,
      images: [`/og/${tool.id}.png`],
    },
    appleWebApp: {
      capable: true,
      title: tool.name,
      statusBarStyle: "default",
    },
  };
}

/** WebApplicationのJSON-LD */
export function toolJsonLd(tool: ToolMeta): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.id}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    inLanguage: "ja",
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
    publisher: {
      "@type": "Organization",
      name: "ココロＡＩ合同会社",
      url: "https://www.cocoroai.co.jp/",
    },
  });
}
