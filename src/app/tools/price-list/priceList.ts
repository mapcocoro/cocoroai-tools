// 料金表・メニュー表メーカー: 型・価格整形・localStorage
// 価格は「自由入力」を許容しつつ、数値ならカンマ整形して表示する方針。
// 店頭表示は総額表示(税込)が原則のため、プレビューは常に税込で表示し、
// 入力モード(税込で入力 / 税抜で入力)だけを切り替える設計にした。

export interface PriceItem {
  id: string;
  name: string;
  /** 自由入力。数値(全角・カンマ・¥混じり可)ならカンマ整形、文字(「時価」等)はそのまま表示 */
  price: string;
  /** 説明ひとこと(任意) */
  note: string;
  /** 価格の後ろに「〜」を付ける */
  tilde: boolean;
}

export interface PriceCategory {
  id: string;
  name: string;
  items: PriceItem[];
}

export type PriceInputMode = "incl" | "excl";
export type PreviewStyle = "simple" | "soft";

export interface PriceListData {
  shopName: string;
  subtitle: string;
  inputMode: PriceInputMode;
  /** 価格の後ろに「(税込)」表記を付ける */
  showTaxLabel: boolean;
  style: PreviewStyle;
  categories: PriceCategory[];
}

export const TAX_RATE = 0.1; // 10%固定(軽減税率は扱わない)

// ---- ID採番(ユーザー操作時のみ使用。初期stateは固定IDでhydrationずれを防ぐ) ----
let seq = 0;
export function newId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq.toString(36)}`;
}

export function emptyItem(id: string): PriceItem {
  return { id, name: "", price: "", note: "", tilde: false };
}

export function emptyCategory(id: string, itemId: string): PriceCategory {
  return { id, name: "", items: [emptyItem(itemId)] };
}

export function getDefaultData(): PriceListData {
  return {
    shopName: "",
    subtitle: "",
    inputMode: "incl",
    showTaxLabel: true,
    style: "simple",
    categories: [emptyCategory("c1", "i1")],
  };
}

// ---- 価格の解釈・整形 ----

/** 「3,500」「¥3500」「３５００」などを数値に。数値でなければ null */
export function parsePriceNumber(raw: string): number | null {
  const normalized = raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[¥￥,，\s円]/g, "");
  if (normalized === "" || !/^\d+$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** プレビューに出す価格文字列(常に税込)。数値でなければ入力をそのまま返す */
export function formatDisplayPrice(
  raw: string,
  tilde: boolean,
  inputMode: PriceInputMode
): { text: string; isNumeric: boolean } {
  const n = parsePriceNumber(raw);
  if (n === null) {
    const t = raw.trim();
    return { text: t + (t && tilde ? "〜" : ""), isNumeric: false };
  }
  // 税抜で入力されたときは税込(10%)に換算。端数は四捨五入
  const incl = inputMode === "incl" ? n : Math.round(n * (1 + TAX_RATE));
  return {
    text: `¥${incl.toLocaleString("ja-JP")}${tilde ? "〜" : ""}`,
    isNumeric: true,
  };
}

// ---- localStorage(storage.tsの流儀: cocoroai_tools_ プレフィックス + try/catch) ----
const DRAFT_KEY = "cocoroai_tools_pricelist_draft";

export function savePriceListDraft(data: PriceListData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save price list draft:", error);
  }
}

export function loadPriceListDraft(): PriceListData | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as PriceListData;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to load price list draft:", error);
    return null;
  }
}

export function clearPriceListDraft(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear price list draft:", error);
  }
}
