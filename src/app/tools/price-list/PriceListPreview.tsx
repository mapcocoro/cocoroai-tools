// 料金表プレビュー(印刷=この内容がそのままA4に出る)
// スタイル2種: simple(白地・罫線) / soft(クリーム地・角丸・カフェ風)
// どちらもA4縦1枚を想定したコンパクトな行間
import {
  formatDisplayPrice,
  type PriceCategory,
  type PriceItem,
  type PriceListData,
} from "./priceList";

interface Props {
  data: PriceListData;
}

/** 名前も価格も空の行はプレビューに出さない */
function visibleItems(category: PriceCategory): PriceItem[] {
  return category.items.filter((it) => it.name.trim() || it.price.trim());
}

function PriceText({
  item,
  data,
  className,
  taxLabelClassName,
}: {
  item: PriceItem;
  data: PriceListData;
  className: string;
  taxLabelClassName: string;
}) {
  const { text, isNumeric } = formatDisplayPrice(
    item.price,
    item.tilde,
    data.inputMode
  );
  if (!text) return null;
  return (
    <span className={`tnum whitespace-nowrap ${className}`}>
      {text}
      {isNumeric && data.showTaxLabel && (
        <span className={taxLabelClassName}>(税込)</span>
      )}
    </span>
  );
}

function EmptyHint() {
  return (
    <p className="no-print py-16 text-center text-xs leading-relaxed text-slate-400">
      左のフォームにメニュー名と金額を入れると
      <br />
      ここに料金表が表示されます
    </p>
  );
}

// ---- シンプル(白地・罫線・きっちり) ----
function SimplePreview({ data }: Props) {
  const categories = data.categories.filter(
    (c) => c.name.trim() || visibleItems(c).length > 0
  );
  return (
    <div className="doc-root mx-auto min-w-[420px] max-w-[560px] bg-white px-2 py-4 text-sm text-black">
      <header className="doc-section mb-6 text-center">
        <h1 className="font-serif text-2xl font-bold tracking-[0.2em]">
          {data.shopName.trim() || "料金表"}
        </h1>
        {data.subtitle.trim() && (
          <p className="mt-1 text-[11px] tracking-[0.3em] text-slate-500">
            {data.subtitle}
          </p>
        )}
        <div className="mx-auto mt-3 w-16 border-b-2 border-slate-800" />
      </header>

      {categories.length === 0 && <EmptyHint />}

      <div className="space-y-6">
        {categories.map((cat) => (
          <section key={cat.id} className="doc-section">
            {cat.name.trim() && (
              <h2 className="doc-rule-b mb-1 border-b border-slate-700 pb-1 text-[13px] font-bold tracking-[0.15em]">
                {cat.name}
              </h2>
            )}
            <ul>
              {visibleItems(cat).map((item) => (
                <li
                  key={item.id}
                  className="doc-row doc-rule-b border-b border-slate-200 py-1.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="break-words text-[13px]">
                      {item.name.trim() || "—"}
                    </span>
                    <PriceText
                      item={item}
                      data={data}
                      className="text-[13px] font-semibold"
                      taxLabelClassName="ml-0.5 text-[9px] font-normal text-slate-500"
                    />
                  </div>
                  {item.note.trim() && (
                    <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

// ---- やわらか(クリーム地・角丸・カフェ風) ----
function SoftPreview({ data }: Props) {
  const categories = data.categories.filter(
    (c) => c.name.trim() || visibleItems(c).length > 0
  );
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
        <p className="text-[10px] tracking-[0.4em] text-[#b09a6a]">MENU</p>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-[0.15em] text-[#3d3322]">
          {data.shopName.trim() || "メニュー"}
        </h1>
        {data.subtitle.trim() && (
          <p className="mt-1.5 text-[11px] tracking-[0.2em] text-[#8d7a52]">
            {data.subtitle}
          </p>
        )}
        <p className="mt-2 text-[10px] tracking-[0.5em] text-[#c4b186]">
          ・・・
        </p>
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
              </h2>
            )}
            <ul className="space-y-1">
              {visibleItems(cat).map((item) => (
                <li key={item.id} className="doc-row py-1">
                  <div className="flex items-baseline gap-2">
                    <span className="break-words text-[13px]">
                      {item.name.trim() || "—"}
                    </span>
                    <span
                      aria-hidden
                      className="mb-[3px] min-w-4 flex-1 self-end border-b border-dotted border-[#cdbd95]"
                    />
                    <PriceText
                      item={item}
                      data={data}
                      className="text-[13px] font-semibold text-[#5a4a2e]"
                      taxLabelClassName="ml-0.5 text-[9px] font-normal text-[#a08f68]"
                    />
                  </div>
                  {item.note.trim() && (
                    <p className="mt-0.5 text-[10px] leading-snug text-[#94835f]">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function PriceListPreview({ data }: Props) {
  return data.style === "soft" ? (
    <SoftPreview data={data} />
  ) : (
    <SimplePreview data={data} />
  );
}
