import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/tools";

export const metadata: Metadata = {
  title: "ご利用にあたって(免責事項)",
  description: `${SITE_NAME}の利用条件・免責事項・データの取り扱いについて`,
  robots: { index: false },
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "本サイトについて",
    body: "「しごとの小道具」は、ココロＡＩ合同会社が無料で提供する業務ミニツール集です。どなたでも、登録なしでご利用いただけます。",
  },
  {
    title: "データの取り扱い(重要)",
    body: (
      <>
        各ツールに入力した内容や写真は、お使いの端末(ブラウザ)の中だけで処理・保存され、
        当社のサーバーには送信されません。ブラウザの履歴・キャッシュの削除や端末の故障等で
        データが消えた場合、復元はできません。
        <strong>
          見積書・請求書などの大切な書類は、必ずPDF保存や印刷でお手元に残してください。
        </strong>
        なお、「こんな機能欲しい」フォームを送信した場合のみ、入力いただいた内容が当社に届きます。
      </>
    ),
  },
  {
    title: "法的・税務的アドバイスの非提供",
    body: "本サイトのツール(見積書・請求書・領収書・損益分岐点計算など)は作成を補助するものであり、法的・税務的アドバイスを提供するものではありません。インボイス制度への適合性や記載内容の最終確認は、ご利用者様の責任でお願いします。",
  },
  {
    title: "無保証・免責",
    body: "本サイトは現状有姿で提供され、動作・正確性・特定目的への適合性を保証しません。本サイトの利用により生じたいかなる損害についても、当社は責任を負いません。",
  },
  {
    title: "サービスの変更・終了",
    body: "事前の予告なく、機能の変更・中断・終了を行うことがあります。",
  },
  {
    title: "お問い合わせ",
    body: (
      <>
        ココロＡＩ合同会社 —{" "}
        <a
          href="mailto:info@cocoroai.co.jp"
          className="text-teal underline underline-offset-4"
        >
          info@cocoroai.co.jp
        </a>
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-xs text-ink-soft hover:underline">
          ← トップへ戻る
        </Link>
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink">
          ご利用にあたって
        </h1>
        <div className="mt-8 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-ink">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-4 text-xs text-ink-mute">
          制定日: 2026年6月10日
        </p>
      </main>
    </div>
  );
}
