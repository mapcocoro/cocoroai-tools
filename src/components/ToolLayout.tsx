import Link from "next/link";
import { getTool, type ToolId, SITE_NAME } from "@/lib/tools";
import { toolJsonLd } from "@/lib/seo";
import CustomizeCTA from "./CustomizeCTA";
import FeedbackForm from "./FeedbackForm";

/**
 * 全ツールページ共通の骨格。
 * ヘッダー/パンくず/リード文 + children(ツール本体) + 3点セット + フッター
 */
export default function ToolLayout({
  toolId,
  children,
}: {
  toolId: ToolId;
  children: React.ReactNode;
}) {
  const tool = getTool(toolId);
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toolJsonLd(tool) }}
      />
      <header className="no-print border-b border-line bg-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-base font-bold text-ink">
              しごとの小道具
            </span>
            <span className="font-mono text-[10px] tracking-widest text-ink-mute">
              by COCORO AI
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-ink-soft underline-offset-4 hover:underline"
          >
            ツール一覧
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="no-print">
          <p className="font-mono text-xs tracking-widest text-teal">
            FREE TOOL
          </p>
          <h1 className="mt-1 flex items-center gap-3 font-serif text-2xl font-bold text-ink sm:text-3xl">
            {tool.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tool.icon}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0"
              />
            ) : (
              <span aria-hidden>{tool.emoji}</span>
            )}
            {tool.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {tool.lead}
          </p>
        </div>

        <div className="mt-8">{children}</div>

        <div className="mt-12 space-y-6">
          <CustomizeCTA tool={tool} />
          <FeedbackForm tool={tool} />
        </div>
      </main>

      <footer className="no-print border-t border-line py-8 text-center">
        <p className="text-xs text-ink-mute">
          {SITE_NAME} — 小さな会社とお店のための無料ツール集
        </p>
        <p className="mt-2 text-xs text-ink-mute">
          ©{" "}
          <a
            href="https://www.cocoroai.co.jp/"
            className="underline-offset-4 hover:underline"
          >
            ココロＡＩ合同会社
          </a>
          {" ・ "}
          <Link href="/legal/" className="underline-offset-4 hover:underline">
            ご利用にあたって
          </Link>
        </p>
      </footer>
    </div>
  );
}
