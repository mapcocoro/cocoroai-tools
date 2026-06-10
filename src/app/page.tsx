/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { TOOLS, CONTACT_URL, SITE_NAME, SITE_URL } from "@/lib/tools";

export default function Home() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: "ja",
            publisher: {
              "@type": "Organization",
              name: "ココロＡＩ合同会社",
              url: "https://www.cocoroai.co.jp/",
            },
          }),
        }}
      />

      <header className="relative overflow-hidden border-b border-line">
        {/* ポップな背景ブロブ */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-aqua-soft blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-sun/15 blur-2xl"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 sm:py-14">
          <div className="text-center sm:text-left">
            <p className="font-mono text-xs tracking-[0.3em] text-aqua">
              COCORO AI TOOLS
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-ink sm:text-5xl">
              しごとの<span className="text-grad-aqua">小道具</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
              小さな会社とお店のための、無料で使える業務ミニツール集。
              <br className="hidden sm:block" />
              登録不要・インストール不要。ブラウザを開けば、すぐ使えます。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {["完全無料", "登録不要", "スマホでOK", "データは端末の中だけ"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="font-hand rounded-full bg-aqua-soft px-4 py-1.5 text-sm font-bold text-teal"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="relative shrink-0">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-left-24 sm:translate-x-0 sm:top-2">
              <span className="font-hand inline-block whitespace-nowrap rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm font-bold text-teal shadow-sm">
                つかってみてね!
              </span>
            </div>
            <img
              src="/images/cocorobo-wave.png"
              alt="ここロボちゃん"
              width={180}
              height={177}
              className="floaty mt-6 h-auto w-36 sm:mt-0 sm:w-44"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) =>
            tool.released ? (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}/`}
                className="group rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:border-aqua hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {tool.icon ? (
                    <img
                      src={tool.icon}
                      alt=""
                      width={48}
                      height={48}
                      className="mt-0.5 h-12 w-12 shrink-0 transition group-hover:scale-110"
                    />
                  ) : (
                    <span aria-hidden className="text-3xl">
                      {tool.emoji}
                    </span>
                  )}
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink group-hover:text-teal">
                      {tool.name}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-right font-mono text-[10px] tracking-widest text-aqua opacity-0 transition group-hover:opacity-100">
                  OPEN →
                </p>
              </Link>
            ) : (
              <div
                key={tool.id}
                className="rounded-2xl border border-dashed border-line bg-paper-2 p-6"
              >
                <div className="flex items-start gap-4 opacity-60">
                  <span aria-hidden className="text-3xl">
                    {tool.emoji}
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink">
                      {tool.name}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-right font-mono text-[10px] tracking-widest text-sun-ink">
                  COMING SOON
                </p>
              </div>
            )
          )}
          {[
            {
              icon: "/icons/co/icon-co-chat.png",
              name: "AIチャットボット(ここロボちゃん)",
              desc: "ホームページに設置して、お客様の質問に24時間自動でお答え。会社HPの右下で体験できます。",
              href: "https://www.cocoroai.co.jp/",
            },
            {
              icon: "/icons/co/icon-co-time.png",
              name: "Co.Time(予定調整)",
              desc: "URLを送るだけで、相手が空き時間を選んで予約できる予定調整ツール。Googleカレンダー連携。",
              href: "https://cotime.cocoroai.co.jp",
            },
            {
              icon: "/icons/co/icon-co-link.png",
              name: "Co.Link(お問い合わせフォーム)",
              desc: "シンプルで安全なお問い合わせフォーム。ホームページにそのまま設置できます。",
              href: CONTACT_URL,
            },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:border-aqua hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="mt-0.5 h-12 w-12 shrink-0 transition group-hover:scale-110"
                />
                <div>
                  <h2 className="font-serif text-lg font-bold text-ink group-hover:text-teal">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {item.desc}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-right font-mono text-[10px] tracking-widest text-aqua opacity-0 transition group-hover:opacity-100">
                OPEN ↗
              </p>
            </a>
          ))}
        </div>

        <section
          className="mt-12 rounded-2xl p-8 text-center sm:p-10"
          style={{
            background: "linear-gradient(135deg, #00A4C6, #00C6A9)",
          }}
        >
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
            「うちの業務に合わせたツールが欲しい」
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/90">
            ここにあるツールは、すべてココロＡＩが自分の手で作っています。
            御社の仕事に合わせた「うちだけの一本」のご相談もどうぞ。
          </p>
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-sun px-8 py-3 text-sm font-bold text-sun-ink transition hover:brightness-105"
          >
            相談してみる(無料)
          </a>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center">
        <p className="text-xs text-ink-mute">
          ©{" "}
          <a
            href="https://www.cocoroai.co.jp/"
            className="underline-offset-4 hover:underline"
          >
            ココロＡＩ合同会社
          </a>
        </p>
        <p className="mt-2 text-xs text-ink-mute">
          <Link href="/legal/" className="underline-offset-4 hover:underline">
            ご利用にあたって(免責事項)
          </Link>
        </p>
      </footer>
    </div>
  );
}
