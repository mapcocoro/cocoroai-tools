// 多言語メニュープレビュー(印刷=この内容がそのままA4に出る)
// スタイル2種: simple(白地・罫線) / soft(クリーム地・角丸)
// 各項目: 日本語名(主) + 有効言語の対訳(小さめ) + 価格。凡例とお金の注意書きは有効言語で併記。
import { FIXED } from "./dict";
import {
  enabledLangs,
  formatDisplayPrice,
  type LangCode,
  type MenuCategory,
  type MenuI18nData,
  type MenuItem,
} from "./menuI18n";

interface Props {
  data: MenuI18nData;
}

function visibleItems(category: MenuCategory): MenuItem[] {
  return category.items.filter((it) => it.name.trim() || it.price.trim());
}

/** 有効言語のうち、入力がある訳だけを「 / 」区切りで1行にする */
function trLine(tr: { en: string; zh: string; ko: string }, langs: LangCode[]): string {
  return langs
    .map((c) => tr[c].trim())
    .filter(Boolean)
    .join("　/　");
}

function badgeMarks(item: MenuItem): string {
  const marks: string[] = [];
  if (item.reco) marks.push("★");
  if (item.spicy) marks.push("🌶");
  if (item.veg) marks.push("🌿");
  return marks.join(" ");
}

function usesBadge(data: MenuI18nData, key: "reco" | "spicy" | "veg"): boolean {
  return data.categories.some((c) => c.items.some((i) => i[key]));
}

/** 凡例(★=おすすめ Recommended 推荐 추천 のような1行) */
function BadgeLegend({ data, className }: { data: MenuI18nData; className: string }) {
  const langs = enabledLangs(data);
  const rows: string[] = [];
  const mk = (mark: string, b: { ja: string; en: string; zh: string; ko: string }) =>
    `${mark} ${[b.ja, ...langs.map((c) => b[c])].join(" / ")}`;
  if (usesBadge(data, "reco")) rows.push(mk("★", FIXED.badges.reco));
  if (usesBadge(data, "spicy")) rows.push(mk("🌶", FIXED.badges.spicy));
  if (usesBadge(data, "veg")) rows.push(mk("🌿", FIXED.badges.veg));
  if (rows.length === 0) return null;
  return (
    <div className={className}>
      {rows.map((r) => (
        <p key={r}>{r}</p>
      ))}
    </div>
  );
}

/** 税込・日本円の注意書き(日本語 + 有効言語) */
function MoneyNotes({ data, className }: { data: MenuI18nData; className: string }) {
  const langs = enabledLangs(data);
  if (!data.showTaxLabel) return null;
  const lines = [
    `${FIXED.taxIncluded.ja} / ${FIXED.jpy.ja}`,
    ...langs.map((c) => `${FIXED.taxIncluded[c]} ${FIXED.jpy[c]}`),
  ];
  return (
    <div className={className}>
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

function EmptyHint() {
  return (
    <p className="no-print py-16 text-center text-xs leading-relaxed text-slate-400">
      左のフォームにメニュー名と金額を入れると
      <br />
      ここに多言語メニューが表示されます
    </p>
  );
}

function docTitle(data: MenuI18nData): { ja: string; sub: string } {
  const langs = enabledLangs(data);
  const fixed = data.titleKind === "menu" ? FIXED.menuTitle : FIXED.priceListTitle;
  // 英語表記(MENU / PRICE LIST)を軸に、中韓を添える
  const sub = [fixed.en, ...langs.filter((c) => c !== "en").map((c) => fixed[c])].join(
    "　"
  );
  return { ja: data.titleKind === "menu" ? "お品書き" : "料金表", sub };
}

// ---- シンプル(白地・罫線) ----
function SimplePreview({ data }: Props) {
  const langs = enabledLangs(data);
  const categories = data.categories.filter(
    (c) => c.name.trim() || visibleItems(c).length > 0
  );
  const title = docTitle(data);
  return (
    <div className="doc-root mx-auto min-w-[420px] max-w-[560px] bg-white px-2 py-4 text-sm text-black">
      <header className="doc-section mb-6 text-center">
        <h1 className="font-serif text-2xl font-bold tracking-[0.2em]">
          {data.shopName.trim() || title.ja}
        </h1>
        <p className="mt-1 text-[11px] tracking-[0.3em] text-slate-500">{title.sub}</p>
        <div className="mx-auto mt-3 w-16 border-b-2 border-slate-800" />
      </header>

      {categories.length === 0 && <EmptyHint />}

      <div className="space-y-6">
        {categories.map((cat) => (
          <section key={cat.id} className="doc-section">
            {cat.name.trim() && (
              <h2 className="doc-rule-b mb-1 border-b border-slate-700 pb-1 text-[13px] font-bold tracking-[0.15em]">
                {cat.name}
                {trLine(cat.tr, langs) && (
                  <span className="ml-2 text-[10px] font-normal tracking-normal text-slate-500">
                    {trLine(cat.tr, langs)}
                  </span>
                )}
              </h2>
            )}
            <ul>
              {visibleItems(cat).map((item) => {
                const { text, isNumeric } = formatDisplayPrice(
                  item.price,
                  item.tilde,
                  data.inputMode
                );
                const marks = badgeMarks(item);
                const tl = trLine(item.tr, langs);
                return (
                  <li
                    key={item.id}
                    className="doc-row doc-rule-b border-b border-slate-200 py-1.5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="break-words text-[13px]">
                        {item.name.trim() || "—"}
                        {marks && (
                          <span className="ml-1.5 text-[11px]">{marks}</span>
                        )}
                      </span>
                      {text && (
                        <span className="tnum whitespace-nowrap text-[13px] font-semibold">
                          {text}
                          {isNumeric && data.showTaxLabel && (
                            <span className="ml-0.5 text-[9px] font-normal text-slate-500">
                              (税込)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {tl && (
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                        {tl}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {categories.length > 0 && (
        <footer className="doc-section mt-6 border-t border-slate-300 pt-2">
          <BadgeLegend
            data={data}
            className="space-y-0.5 text-[9.5px] leading-snug text-slate-500"
          />
          <MoneyNotes
            data={data}
            className="mt-1.5 space-y-0.5 text-[9.5px] leading-snug text-slate-500"
          />
        </footer>
      )}
    </div>
  );
}

// ---- やわらか(クリーム地・角丸) ----
function SoftPreview({ data }: Props) {
  const langs = enabledLangs(data);
  const categories = data.categories.filter(
    (c) => c.name.trim() || visibleItems(c).length > 0
  );
  const title = docTitle(data);
  return (
    <div
      className="doc-root doc-keep-bg mx-auto min-w-[420px] max-w-[560px] rounded-[24px] bg-[#f7f1e3] px-7 py-8 text-sm text-[#4a3f2e]"
      style={
        {
          "--doc-keep-bg": "#f7f1e3",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        } as React.CSSProperties
      }
    >
      <header className="doc-section mb-6 text-center">
        <p className="text-[10px] tracking-[0.4em] text-[#b09a6a]">{title.sub}</p>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-[0.15em] text-[#3d3322]">
          {data.shopName.trim() || title.ja}
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.5em] text-[#c4b186]">・・・</p>
      </header>

      {categories.length === 0 && <EmptyHint />}

      <div className="space-y-5">
        {categories.map((cat) => (
          <section
            key={cat.id}
            className="doc-section rounded-2xl bg-white/70 px-5 py-4"
          >
            {cat.name.trim() && (
              <h2 className="mb-2 border-b border-dashed border-[#d8c79c] pb-1.5 font-serif text-[14px] font-bold tracking-[0.15em] text-[#6b5836]">
                {cat.name}
                {trLine(cat.tr, langs) && (
                  <span className="ml-2 text-[10px] font-normal tracking-normal text-[#a08f68]">
                    {trLine(cat.tr, langs)}
                  </span>
                )}
              </h2>
            )}
            <ul className="space-y-1">
              {visibleItems(cat).map((item) => {
                const { text, isNumeric } = formatDisplayPrice(
                  item.price,
                  item.tilde,
                  data.inputMode
                );
                const marks = badgeMarks(item);
                const tl = trLine(item.tr, langs);
                return (
                  <li key={item.id} className="doc-row py-1">
                    <div className="flex items-baseline gap-2">
                      <span className="break-words text-[13px]">
                        {item.name.trim() || "—"}
                        {marks && (
                          <span className="ml-1.5 text-[11px]">{marks}</span>
                        )}
                      </span>
                      <span
                        aria-hidden
                        className="mb-[3px] min-w-4 flex-1 self-end border-b border-dotted border-[#cdbd95]"
                      />
                      {text && (
                        <span className="tnum whitespace-nowrap text-[13px] font-semibold text-[#5a4a2e]">
                          {text}
                          {isNumeric && data.showTaxLabel && (
                            <span className="ml-0.5 text-[9px] font-normal text-[#a08f68]">
                              (税込)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {tl && (
                      <p className="mt-0.5 text-[10.5px] leading-snug text-[#94835f]">
                        {tl}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {categories.length > 0 && (
        <footer className="doc-section mt-5 px-1">
          <BadgeLegend
            data={data}
            className="space-y-0.5 text-[9.5px] leading-snug text-[#94835f]"
          />
          <MoneyNotes
            data={data}
            className="mt-1.5 space-y-0.5 text-[9.5px] leading-snug text-[#94835f]"
          />
        </footer>
      )}
    </div>
  );
}

export default function MultilingualMenuPreview({ data }: Props) {
  return data.style === "soft" ? (
    <SoftPreview data={data} />
  ) : (
    <SimplePreview data={data} />
  );
}
