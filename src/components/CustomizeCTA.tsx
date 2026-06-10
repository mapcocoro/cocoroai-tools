import { CONTACT_URL, type ToolMeta } from "@/lib/tools";

/** 「御社仕様にカスタムできます」枠。価格は書かない(自社方針) */
export default function CustomizeCTA({ tool }: { tool: ToolMeta }) {
  return (
    <section className="no-print rounded-2xl border border-teal-soft bg-teal-softer p-6 sm:p-8">
      <p className="font-mono text-xs tracking-widest text-teal">
        CUSTOMIZE
      </p>
      <h2 className="mt-2 font-serif text-xl font-bold text-ink">
        このツール、御社仕様にカスタムできます
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        ここにあるのは誰でも使える汎用版です。御社の業務に合わせた
        「うちだけの一本」もお作りします。たとえば──
      </p>
      <ul className="mt-4 space-y-2">
        {tool.customizeExamples.map((ex) => (
          <li key={ex} className="flex items-start gap-2 text-sm text-ink">
            <span aria-hidden className="mt-0.5 text-teal">
              ◆
            </span>
            {ex}
          </li>
        ))}
      </ul>
      <a
        href={`${CONTACT_URL}?tool=${tool.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-deep"
      >
        カスタムの相談をしてみる(無料)
      </a>
      <p className="mt-3 text-xs text-ink-mute">
        ココロＡＩ合同会社が運営しています。
      </p>
    </section>
  );
}
