"use client";
// 料金表・メニュー表メーカー 本体
// かんたん見積書(EstimateTool)と同じ骨格: 左フォーム + 右PreviewPanel + 自動保存
// 税計算が目的ではなく「店頭に置ける表示物」を作るツールなので、
// 明細はItemsTableを使わず、このツール専用の軽いエディタにしている
import { useEffect, useState } from "react";
import PreviewPanel from "@/components/chouhyo/PreviewPanel";
import {
  inputCls,
  labelCls,
  headingCls,
  checkboxCls,
} from "@/components/chouhyo/fieldStyles";
import {
  clearPriceListDraft,
  emptyCategory,
  emptyItem,
  getDefaultData,
  loadPriceListDraft,
  newId,
  savePriceListDraft,
  type PriceCategory,
  type PriceItem,
  type PriceListData,
  type PreviewStyle,
} from "./priceList";
import PriceListPreview from "./PriceListPreview";

// ---- 小さな共通部品 ----

/** ↑↓削除のミニボタン */
function MiniBtn({
  label,
  title,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card text-sm transition-colors sm:h-7 sm:w-7 ${
        danger
          ? "text-ink-mute hover:border-red-300 hover:text-red-600"
          : "text-ink-soft hover:bg-paper-2"
      } disabled:cursor-default disabled:opacity-30 disabled:hover:bg-card`}
    >
      {label}
    </button>
  );
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function PriceListTool() {
  const [data, setData] = useState<PriceListData>(getDefaultData);
  const [isInitialized, setIsInitialized] = useState(false);

  // マウント時にlocalStorageから復元
  useEffect(() => {
    const draft = loadPriceListDraft();
    if (draft) {
      setData({ ...getDefaultData(), ...draft });
    }
    setIsInitialized(true);
  }, []);

  // 変更のたびに自動保存
  useEffect(() => {
    if (!isInitialized) return;
    savePriceListDraft(data);
  }, [data, isInitialized]);

  // ---- ハンドラ ----
  const patch = (p: Partial<PriceListData>) =>
    setData((prev) => ({ ...prev, ...p }));

  const patchCategory = (catIndex: number, p: Partial<PriceCategory>) =>
    setData((prev) => {
      const categories = [...prev.categories];
      categories[catIndex] = { ...categories[catIndex], ...p };
      return { ...prev, categories };
    });

  const patchItem = (catIndex: number, itemIndex: number, p: Partial<PriceItem>) =>
    setData((prev) => {
      const categories = [...prev.categories];
      const items = [...categories[catIndex].items];
      items[itemIndex] = { ...items[itemIndex], ...p };
      categories[catIndex] = { ...categories[catIndex], items };
      return { ...prev, categories };
    });

  const addCategory = () =>
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, emptyCategory(newId("c"), newId("i"))],
    }));

  const removeCategory = (catIndex: number) =>
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== catIndex),
    }));

  const moveCategory = (catIndex: number, dir: -1 | 1) =>
    setData((prev) => {
      const j = catIndex + dir;
      if (j < 0 || j >= prev.categories.length) return prev;
      return { ...prev, categories: swap(prev.categories, catIndex, j) };
    });

  const addItem = (catIndex: number) =>
    patchCategory(catIndex, {
      items: [...data.categories[catIndex].items, emptyItem(newId("i"))],
    });

  const removeItem = (catIndex: number, itemIndex: number) =>
    setData((prev) => {
      const categories = [...prev.categories];
      categories[catIndex] = {
        ...categories[catIndex],
        items: categories[catIndex].items.filter((_, i) => i !== itemIndex),
      };
      return { ...prev, categories };
    });

  const moveItem = (catIndex: number, itemIndex: number, dir: -1 | 1) =>
    setData((prev) => {
      const cat = prev.categories[catIndex];
      const j = itemIndex + dir;
      if (j < 0 || j >= cat.items.length) return prev;
      const categories = [...prev.categories];
      categories[catIndex] = { ...cat, items: swap(cat.items, itemIndex, j) };
      return { ...prev, categories };
    });

  const handleNew = () => {
    if (!confirm("現在の入力内容をクリアして新規作成しますか？")) return;
    clearPriceListDraft();
    setData(getDefaultData());
  };

  const styleBtn = (value: PreviewStyle, label: string, hint: string) => (
    <button
      type="button"
      onClick={() => patch({ style: value })}
      aria-pressed={data.style === value}
      className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        data.style === value
          ? "border-teal bg-teal-softer"
          : "border-line bg-card hover:bg-paper-2"
      }`}
    >
      <span className="block text-sm font-bold text-ink">{label}</span>
      <span className="mt-0.5 block text-[11px] text-ink-mute">{hint}</span>
    </button>
  );

  return (
    // ToolLayoutのmax-w-4xlだとプレビューが窮屈なため、見積書と同じく広幅にブレイクアウト
    // (印刷時はtransformが#print-areaの基準枠になるのを避けるため解除)
    <div className="relative left-1/2 grid w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-1 gap-6 lg:grid-cols-2 print:static print:left-0 print:w-auto print:translate-x-0">
      {/* フォーム側(印刷時は非表示) */}
      <section className="no-print">
        <div className="rounded-2xl border border-line bg-card shadow-xs">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
            <h2 className="text-sm font-bold text-ink">料金表の内容</h2>
            <button
              type="button"
              onClick={handleNew}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs text-ink-soft transition-colors hover:bg-paper-2"
            >
              新規作成
            </button>
          </div>

          <div className="space-y-6 p-4">
            {/* お店の情報 */}
            <div className="space-y-3">
              <h3 className={headingCls}>お店の情報</h3>
              <div className="space-y-1">
                <label className={labelCls} htmlFor="pl-shop-name">
                  お店の名前・タイトル(なくてもOK)
                </label>
                <input
                  id="pl-shop-name"
                  className={inputCls}
                  value={data.shopName}
                  onChange={(e) => patch({ shopName: e.target.value })}
                  placeholder="例：Hair Salon COCORO / 料金のごあんない"
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls} htmlFor="pl-subtitle">
                  ひとこと(なくてもOK)
                </label>
                <input
                  id="pl-subtitle"
                  className={inputCls}
                  value={data.subtitle}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                  placeholder="例：PRICE LIST / 2026年6月版"
                />
              </div>
            </div>

            {/* 価格の表示方法 */}
            <div className="space-y-2">
              <h3 className={headingCls}>価格の表示</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="pl-input-mode"
                    className={checkboxCls}
                    checked={data.inputMode === "incl"}
                    onChange={() => patch({ inputMode: "incl" })}
                  />
                  税込価格を入力
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="pl-input-mode"
                    className={checkboxCls}
                    checked={data.inputMode === "excl"}
                    onChange={() => patch({ inputMode: "excl" })}
                  />
                  税抜価格を入力
                </label>
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  className={checkboxCls}
                  checked={data.showTaxLabel}
                  onChange={(e) => patch({ showTaxLabel: e.target.checked })}
                />
                価格に「(税込)」の表記を付ける
              </label>
              <p className="text-[11px] leading-relaxed text-ink-mute">
                ※お客様向けの価格は税込で表示するきまり(総額表示)のため、表に出る価格はいつも税込です。
                「税抜価格を入力」を選ぶと、入れた数字に10%を足した税込価格が自動で表示されます。
              </p>
            </div>

            {/* スタイル */}
            <div className="space-y-2">
              <h3 className={headingCls}>デザイン</h3>
              <div className="flex gap-2">
                {styleBtn("simple", "シンプル", "白地・罫線。サロン・士業・教室に")}
                {styleBtn("soft", "やわらか", "クリーム地・角丸。カフェ・パン屋さんに")}
              </div>
            </div>

            {/* メニューの内容 */}
            <div className="space-y-3">
              <h3 className={headingCls}>メニューの内容</h3>
              {data.categories.map((cat, ci) => (
                <div
                  key={cat.id}
                  className="space-y-3 rounded-xl border border-line bg-paper-2/60 p-3"
                >
                  {/* 見出し行 */}
                  <div className="flex items-center gap-1.5">
                    <input
                      className={inputCls}
                      value={cat.name}
                      onChange={(e) => patchCategory(ci, { name: e.target.value })}
                      placeholder="見出し(例：カット、ドリンク)"
                      aria-label={`見出し${ci + 1}`}
                    />
                    <MiniBtn
                      label="↑"
                      title="見出しを上へ"
                      onClick={() => moveCategory(ci, -1)}
                      disabled={ci === 0}
                    />
                    <MiniBtn
                      label="↓"
                      title="見出しを下へ"
                      onClick={() => moveCategory(ci, 1)}
                      disabled={ci === data.categories.length - 1}
                    />
                    <MiniBtn
                      label="×"
                      title="見出しごと削除"
                      onClick={() => {
                        if (
                          cat.items.some((it) => it.name || it.price) &&
                          !confirm("この見出しと中の項目をすべて削除しますか？")
                        )
                          return;
                        removeCategory(ci);
                      }}
                      danger
                    />
                  </div>

                  {/* 項目 */}
                  <div className="space-y-2">
                    {cat.items.map((item, ii) => (
                      <div
                        key={item.id}
                        className="space-y-1.5 rounded-lg border border-line bg-card p-2"
                      >
                        <div className="grid grid-cols-[1fr_6.5rem] gap-1.5">
                          <input
                            className={inputCls}
                            value={item.name}
                            onChange={(e) => patchItem(ci, ii, { name: e.target.value })}
                            placeholder="メニュー名(例：カット)"
                            aria-label={`メニュー名${ii + 1}`}
                          />
                          <input
                            className={`${inputCls} text-right`}
                            value={item.price}
                            onChange={(e) =>
                              patchItem(ci, ii, { price: e.target.value })
                            }
                            placeholder="3500"
                            inputMode="numeric"
                            aria-label={`価格${ii + 1}`}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            className={inputCls}
                            value={item.note}
                            onChange={(e) => patchItem(ci, ii, { note: e.target.value })}
                            placeholder="ひとこと(例：シャンプー込み)※なくてもOK"
                            aria-label={`説明${ii + 1}`}
                          />
                          <label
                            className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-ink-soft"
                            title="価格の後ろに「〜」を付ける"
                          >
                            <input
                              type="checkbox"
                              className={checkboxCls}
                              checked={item.tilde}
                              onChange={(e) =>
                                patchItem(ci, ii, { tilde: e.target.checked })
                              }
                            />
                            〜
                          </label>
                          <MiniBtn
                            label="↑"
                            title="項目を上へ"
                            onClick={() => moveItem(ci, ii, -1)}
                            disabled={ii === 0}
                          />
                          <MiniBtn
                            label="↓"
                            title="項目を下へ"
                            onClick={() => moveItem(ci, ii, 1)}
                            disabled={ii === cat.items.length - 1}
                          />
                          <MiniBtn
                            label="×"
                            title="項目を削除"
                            onClick={() => removeItem(ci, ii)}
                            danger
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(ci)}
                      className="w-full rounded-lg border border-dashed border-line bg-card py-2 text-xs text-ink-soft transition-colors hover:bg-paper-2"
                    >
                      ＋ 項目を追加
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCategory}
                className="w-full rounded-xl border border-dashed border-teal/40 bg-teal-softer/50 py-2.5 text-sm font-medium text-teal transition-colors hover:bg-teal-softer"
              >
                ＋ 見出しを追加(例：カラー、フード)
              </button>
              <p className="text-[11px] text-ink-mute">
                ※価格は数字だけでOK(自動で「¥3,500」の形になります)。「時価」「応相談」など文字もそのまま出せます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* プレビュー側 */}
      <aside
        id="pricelist-preview"
        className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
      >
        <PreviewPanel>
          <PriceListPreview data={data} />
        </PreviewPanel>
      </aside>

      {/* モバイル用プレビューへのジャンプボタン */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("pricelist-preview")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="no-print fixed bottom-5 right-5 z-20 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white shadow-lg lg:hidden"
      >
        ↓ プレビューへ
      </button>
    </div>
  );
}
