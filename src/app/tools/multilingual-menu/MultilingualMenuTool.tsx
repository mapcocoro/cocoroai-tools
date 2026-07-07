"use client";
// 多言語メニューメーカー 本体
// 料金表メーカー(PriceListTool)と同じ骨格: 左フォーム + 右プレビュー + 自動保存。
// 各項目に英・中・韓の対訳欄。内蔵辞書で空欄だけ自動変換(手入力を上書きしない)。
import { useEffect, useState } from "react";
import PreviewPanel from "@/components/chouhyo/PreviewPanel";
import {
  inputCls,
  labelCls,
  headingCls,
  checkboxCls,
} from "@/components/chouhyo/fieldStyles";
import {
  LANGS,
  autoFillTr,
  clearDraft,
  emptyCategory,
  emptyItem,
  enabledLangs,
  getDefaultData,
  loadDraft,
  newId,
  saveDraft,
  type LangCode,
  type MenuCategory,
  type MenuI18nData,
  type MenuItem,
  type MenuStyle,
} from "./menuI18n";
import { lookupJa } from "./dict";
import MultilingualMenuPreview from "./MultilingualMenuPreview";

const LANG_PLACEHOLDER: Record<LangCode, string> = {
  en: "English",
  zh: "中文(簡体字)",
  ko: "한국어",
};

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

/** 翻訳サイトで調べるリンク(無料のWeb翻訳を新しいタブで開くだけ。データ送信はユーザー操作) */
function TranslateHelpLink({ ja }: { ja: string }) {
  if (!ja.trim()) return null;
  const url = `https://translate.google.com/?sl=ja&tl=en&text=${encodeURIComponent(
    ja.trim()
  )}&op=translate`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className="shrink-0 text-[11px] text-teal underline decoration-teal/40 underline-offset-2 hover:decoration-teal"
      title="無料の翻訳サイトを新しいタブで開きます(訳を確認してコピーして貼り付け)"
    >
      翻訳サイトで調べる
    </a>
  );
}

export default function MultilingualMenuTool() {
  const [data, setData] = useState<MenuI18nData>(getDefaultData);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setData({ ...getDefaultData(), ...draft });
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    saveDraft(data);
  }, [data, isInitialized]);

  // ---- ハンドラ ----
  const patch = (p: Partial<MenuI18nData>) =>
    setData((prev) => ({ ...prev, ...p }));

  const patchCategory = (ci: number, p: Partial<MenuCategory>) =>
    setData((prev) => {
      const categories = [...prev.categories];
      categories[ci] = { ...categories[ci], ...p };
      return { ...prev, categories };
    });

  const patchItem = (ci: number, ii: number, p: Partial<MenuItem>) =>
    setData((prev) => {
      const categories = [...prev.categories];
      const items = [...categories[ci].items];
      items[ii] = { ...items[ii], ...p };
      categories[ci] = { ...categories[ci], items };
      return { ...prev, categories };
    });

  /** 日本語名の入力を離れたとき、辞書ヒットなら空欄の訳だけ自動で入れる */
  const autoFillItem = (ci: number, ii: number) => {
    const item = data.categories[ci]?.items[ii];
    if (!item) return;
    const next = autoFillTr(item.name, item.tr);
    if (next) patchItem(ci, ii, { tr: next });
  };

  const autoFillCategory = (ci: number) => {
    const cat = data.categories[ci];
    if (!cat) return;
    const next = autoFillTr(cat.name, cat.tr);
    if (next) patchCategory(ci, { tr: next });
  };

  /** 全体の空欄をまとめて辞書変換 */
  const autoFillAll = () =>
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        tr: autoFillTr(cat.name, cat.tr) ?? cat.tr,
        items: cat.items.map((item) => ({
          ...item,
          tr: autoFillTr(item.name, item.tr) ?? item.tr,
        })),
      })),
    }));

  const addCategory = () =>
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, emptyCategory(newId("c"), newId("i"))],
    }));

  const removeCategory = (ci: number) =>
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== ci),
    }));

  const moveCategory = (ci: number, dir: -1 | 1) =>
    setData((prev) => {
      const j = ci + dir;
      if (j < 0 || j >= prev.categories.length) return prev;
      return { ...prev, categories: swap(prev.categories, ci, j) };
    });

  const addItem = (ci: number) =>
    patchCategory(ci, {
      items: [...data.categories[ci].items, emptyItem(newId("i"))],
    });

  const removeItem = (ci: number, ii: number) =>
    setData((prev) => {
      const categories = [...prev.categories];
      categories[ci] = {
        ...categories[ci],
        items: categories[ci].items.filter((_, i) => i !== ii),
      };
      return { ...prev, categories };
    });

  const moveItem = (ci: number, ii: number, dir: -1 | 1) =>
    setData((prev) => {
      const cat = prev.categories[ci];
      const j = ii + dir;
      if (j < 0 || j >= cat.items.length) return prev;
      const categories = [...prev.categories];
      categories[ci] = { ...cat, items: swap(cat.items, ii, j) };
      return { ...prev, categories };
    });

  const handleNew = () => {
    if (!confirm("現在の入力内容をクリアして新規作成しますか？")) return;
    clearDraft();
    setData(getDefaultData());
  };

  const styleBtn = (value: MenuStyle, label: string, hint: string) => (
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

  const activeLangs = enabledLangs(data);

  return (
    <div className="relative left-1/2 grid w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-1 gap-6 lg:grid-cols-2 print:static print:left-0 print:w-auto print:translate-x-0">
      {/* フォーム側(印刷時は非表示) */}
      <section className="no-print">
        <div className="rounded-2xl border border-line bg-card shadow-xs">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
            <h2 className="text-sm font-bold text-ink">メニューの内容</h2>
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
                <label className={labelCls} htmlFor="mm-shop-name">
                  お店の名前(なくてもOK)
                </label>
                <input
                  id="mm-shop-name"
                  className={inputCls}
                  value={data.shopName}
                  onChange={(e) => patch({ shopName: e.target.value })}
                  placeholder="例：麺屋こころ / Hair Salon COCORO"
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="mm-title-kind"
                    className={checkboxCls}
                    checked={data.titleKind === "menu"}
                    onChange={() => patch({ titleKind: "menu" })}
                  />
                  メニュー表(MENU)
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="mm-title-kind"
                    className={checkboxCls}
                    checked={data.titleKind === "price"}
                    onChange={() => patch({ titleKind: "price" })}
                  />
                  料金表(PRICE LIST)
                </label>
              </div>
            </div>

            {/* 言語 */}
            <div className="space-y-2">
              <h3 className={headingCls}>日本語と併記する言語</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
                {LANGS.map((l) => (
                  <label
                    key={l.code}
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    <input
                      type="checkbox"
                      className={checkboxCls}
                      checked={data.langs[l.code]}
                      onChange={(e) =>
                        patch({ langs: { ...data.langs, [l.code]: e.target.checked } })
                      }
                    />
                    {l.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={autoFillAll}
                className="w-full rounded-xl border border-teal/40 bg-teal-softer/50 py-2.5 text-sm font-medium text-teal transition-colors hover:bg-teal-softer"
              >
                空いている訳を内蔵辞書でまとめて入れる
              </button>
              <p className="text-[11px] leading-relaxed text-ink-mute">
                ※ラーメン・カット・生ビールなど、よく使う言葉(約140語)を内蔵辞書で自動変換します。
                自動変換は目安です。手入力した訳は上書きしません。
                辞書にない言葉は「翻訳サイトで調べる」から確認して貼り付けてください。
              </p>
            </div>

            {/* 価格の表示方法 */}
            <div className="space-y-2">
              <h3 className={headingCls}>価格の表示</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="mm-input-mode"
                    className={checkboxCls}
                    checked={data.inputMode === "incl"}
                    onChange={() => patch({ inputMode: "incl" })}
                  />
                  税込価格を入力
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="mm-input-mode"
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
                「税込(Tax included)」の注意書きを入れる
              </label>
            </div>

            {/* スタイル */}
            <div className="space-y-2">
              <h3 className={headingCls}>デザイン</h3>
              <div className="flex gap-2">
                {styleBtn("simple", "シンプル", "白地・罫線。定食屋・サロン・旅館に")}
                {styleBtn("soft", "やわらか", "クリーム地・角丸。カフェ・甘味処に")}
              </div>
            </div>

            {/* メニューの内容 */}
            <div className="space-y-3">
              <h3 className={headingCls}>メニュー</h3>
              {data.categories.map((cat, ci) => (
                <div
                  key={cat.id}
                  className="space-y-3 rounded-xl border border-line bg-paper-2/60 p-3"
                >
                  {/* 見出し行 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        className={inputCls}
                        value={cat.name}
                        onChange={(e) => patchCategory(ci, { name: e.target.value })}
                        onBlur={() => autoFillCategory(ci)}
                        placeholder="見出し(例：ドリンク、カット)"
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
                    {activeLangs.length > 0 && cat.name.trim() && (
                      <div
                        className="grid gap-1.5"
                        style={{
                          gridTemplateColumns: `repeat(${activeLangs.length}, minmax(0,1fr))`,
                        }}
                      >
                        {activeLangs.map((code) => (
                          <input
                            key={code}
                            className={`${inputCls} text-xs`}
                            value={cat.tr[code]}
                            onChange={(e) =>
                              patchCategory(ci, {
                                tr: { ...cat.tr, [code]: e.target.value },
                              })
                            }
                            placeholder={LANG_PLACEHOLDER[code]}
                            aria-label={`見出し${ci + 1} ${LANG_PLACEHOLDER[code]}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 項目 */}
                  <div className="space-y-2">
                    {cat.items.map((item, ii) => {
                      const dictHit = lookupJa(item.name) !== null;
                      const missingTr =
                        item.name.trim() &&
                        !dictHit &&
                        activeLangs.some((c) => !item.tr[c].trim());
                      return (
                        <div
                          key={item.id}
                          className="space-y-1.5 rounded-lg border border-line bg-card p-2"
                        >
                          <div className="grid grid-cols-[1fr_6.5rem] gap-1.5">
                            <input
                              className={inputCls}
                              value={item.name}
                              onChange={(e) =>
                                patchItem(ci, ii, { name: e.target.value })
                              }
                              onBlur={() => autoFillItem(ci, ii)}
                              placeholder="メニュー名(例：ラーメン)"
                              aria-label={`メニュー名${ii + 1}`}
                            />
                            <input
                              className={`${inputCls} text-right`}
                              value={item.price}
                              onChange={(e) =>
                                patchItem(ci, ii, { price: e.target.value })
                              }
                              placeholder="900"
                              inputMode="numeric"
                              aria-label={`価格${ii + 1}`}
                            />
                          </div>

                          {activeLangs.length > 0 && item.name.trim() && (
                            <div
                              className="grid gap-1.5"
                              style={{
                                gridTemplateColumns: `repeat(${activeLangs.length}, minmax(0,1fr))`,
                              }}
                            >
                              {activeLangs.map((code) => (
                                <input
                                  key={code}
                                  className={`${inputCls} text-xs`}
                                  value={item.tr[code]}
                                  onChange={(e) =>
                                    patchItem(ci, ii, {
                                      tr: { ...item.tr, [code]: e.target.value },
                                    })
                                  }
                                  placeholder={LANG_PLACEHOLDER[code]}
                                  aria-label={`メニュー名${ii + 1} ${LANG_PLACEHOLDER[code]}`}
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <label className="flex cursor-pointer items-center gap-1 text-xs text-ink-soft">
                              <input
                                type="checkbox"
                                className={checkboxCls}
                                checked={item.reco}
                                onChange={(e) =>
                                  patchItem(ci, ii, { reco: e.target.checked })
                                }
                              />
                              ★おすすめ
                            </label>
                            <label className="flex cursor-pointer items-center gap-1 text-xs text-ink-soft">
                              <input
                                type="checkbox"
                                className={checkboxCls}
                                checked={item.spicy}
                                onChange={(e) =>
                                  patchItem(ci, ii, { spicy: e.target.checked })
                                }
                              />
                              辛い
                            </label>
                            <label className="flex cursor-pointer items-center gap-1 text-xs text-ink-soft">
                              <input
                                type="checkbox"
                                className={checkboxCls}
                                checked={item.veg}
                                onChange={(e) =>
                                  patchItem(ci, ii, { veg: e.target.checked })
                                }
                              />
                              ベジ対応
                            </label>
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
                            {missingTr && <TranslateHelpLink ja={item.name} />}
                            <span className="ml-auto flex items-center gap-1.5">
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
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
                ＋ 見出しを追加(例：フード、ドリンク)
              </button>
              <p className="text-[11px] text-ink-mute">
                ※価格は数字だけでOK(自動で「¥900」の形になります)。「時価」など文字もそのまま出せます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* プレビュー側 */}
      <aside
        id="mmenu-preview"
        className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
      >
        <PreviewPanel>
          <MultilingualMenuPreview data={data} />
        </PreviewPanel>
      </aside>

      {/* モバイル用プレビューへのジャンプボタン */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("mmenu-preview")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="no-print fixed bottom-5 right-5 z-20 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white shadow-lg lg:hidden"
      >
        ↓ プレビューへ
      </button>
    </div>
  );
}
