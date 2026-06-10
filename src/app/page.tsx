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
      <header className="border-b border-line">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="font-mono text-xs tracking-[0.3em] text-teal">
            COCORO AI TOOLS
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-5xl">
            しごとの小道具
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            小さな会社とお店のための、無料で使える業務ミニツール集。
            <br className="hidden sm:block" />
            登録不要・インストール不要。ブラウザを開けば、すぐ使えます。
          </p>
          <p className="mt-3 font-mono text-[11px] tracking-widest text-ink-mute">
            FREE / NO SIGN-UP / WORKS ON YOUR PHONE
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) =>
            tool.released ? (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}/`}
                className="group rounded-2xl border border-line bg-card p-6 transition hover:border-teal hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-3xl">
                    {tool.emoji}
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink group-hover:text-teal">
                      {tool.name}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-right font-mono text-[10px] tracking-widest text-teal opacity-0 transition group-hover:opacity-100">
                  OPEN →
                </p>
              </Link>
            ) : (
              <div
                key={tool.id}
                className="rounded-2xl border border-dashed border-line bg-paper-2 p-6"
              >
                <div className="flex items-start gap-3 opacity-60">
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
        </div>

        <section className="mt-12 rounded-2xl bg-teal p-8 text-center sm:p-10">
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
            「うちの業務に合わせたツールが欲しい」
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-teal-soft">
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
          © <a href="https://www.cocoroai.co.jp/" className="underline-offset-4 hover:underline">ココロＡＩ合同会社</a>(千葉県印西市)
        </p>
      </footer>
    </div>
  );
}
