"use client";
// 商品マスタ選択モーダル
// 大カテゴリ(タブ) → 中カテゴリ(見出し) → 商品(タップで明細へ追加)
import { useState } from "react";
import { createPortal } from "react-dom";
import { productCatalog, type Product } from "@/lib/genba/catalog";

const CATEGORY_EMOJI: Record<string, string> = {
  painting: "🎨",
  electric: "💡",
  interior: "🛋️",
  water: "🚿",
  exterior: "🏡",
  other: "📦",
};

export default function ProductPicker({
  onAdd,
  onClose,
}: {
  onAdd: (product: Product) => void;
  onClose: () => void;
}) {
  const [activeCat, setActiveCat] = useState(productCatalog[0].id);
  const [addedCount, setAddedCount] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const category = productCatalog.find((c) => c.id === activeCat) ?? productCatalog[0];

  const handleAdd = (product: Product) => {
    onAdd(product);
    setAddedCount((n) => n + 1);
    setLastAdded(product.id);
    window.setTimeout(() => setLastAdded((cur) => (cur === product.id ? null : cur)), 900);
  };

  // 祖先のtransformでfixedがズレるためbody直下へポータル描画
  return createPortal(
    <div
      className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="商品マスタから項目を追加"
      onClick={onClose}
    >
      <div
        className="flex h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-paper sm:h-[80vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-line bg-card px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-ink">マスタから項目を追加</h3>
            <p className="text-[10px] text-ink-mute">
              単価はサンプルです。追加したあと明細で自由に変えられます
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-teal px-4 py-2 text-xs font-bold text-white"
          >
            {addedCount > 0 ? `閉じる（${addedCount}件追加済み）` : "閉じる"}
          </button>
        </div>

        {/* 大カテゴリタブ */}
        <div className="flex gap-2 overflow-x-auto border-b border-line bg-card px-3 py-2">
          {productCatalog.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCat(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                cat.id === activeCat
                  ? "bg-teal text-white"
                  : "bg-paper-2 text-ink-soft hover:bg-paper"
              }`}
            >
              {CATEGORY_EMOJI[cat.id] ?? "📦"} {cat.name}
            </button>
          ))}
        </div>

        {/* 商品リスト */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {category.subCategories.map((sub) => (
            <section key={sub.id} className="mb-5">
              <h4 className="mb-2 border-l-4 border-teal pl-2 text-xs font-bold text-ink">
                {sub.name}
              </h4>
              <ul className="space-y-1.5">
                {sub.products.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        lastAdded === p.id
                          ? "border-teal bg-teal/10"
                          : "border-line bg-card hover:border-teal/50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {p.name}
                        </span>
                        {p.description && (
                          <span className="block text-[10px] text-ink-mute">{p.description}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-xs font-bold text-teal">
                          ¥{p.unitPrice.toLocaleString("ja-JP")}
                        </span>
                        <span className="block text-[10px] text-ink-mute">/{p.unit}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                          lastAdded === p.id ? "bg-teal text-white" : "bg-paper-2 text-teal"
                        }`}
                      >
                        {lastAdded === p.id ? "✓" : "＋"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
