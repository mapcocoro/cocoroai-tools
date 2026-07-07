// 多言語メニューメーカー: 型・整形・localStorage
// price-list(料金表メーカー)の設計を踏襲し、各項目に英・中・韓の対訳欄を持たせた版。
// 翻訳は内蔵辞書(dict.ts)による自動変換(空欄のみ)＋手入力。外部APIは使わない。

import { lookupJa } from "./dict";

export type LangCode = "en" | "zh" | "ko";
export const LANGS: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "英語", native: "English" },
  { code: "zh", label: "中国語(簡体字)", native: "中文" },
  { code: "ko", label: "韓国語", native: "한국어" },
];

export interface MenuTr {
  en: string;
  zh: string;
  ko: string;
}

export interface MenuItem {
  id: string;
  name: string;
  tr: MenuTr;
  /** 自由入力。数値ならカンマ整形、「時価」等はそのまま */
  price: string;
  tilde: boolean;
  reco: boolean;
  spicy: boolean;
  veg: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  tr: MenuTr;
  items: MenuItem[];
}

export type MenuInputMode = "incl" | "excl";
export type MenuStyle = "simple" | "soft";
export type MenuTitleKind = "menu" | "price";

export interface MenuI18nData {
  shopName: string;
  /** タイトルの種類(MENU / PRICE LIST) */
  titleKind: MenuTitleKind;
  langs: Record<LangCode, boolean>;
  inputMode: MenuInputMode;
  showTaxLabel: boolean;
  style: MenuStyle;
  categories: MenuCategory[];
}

export const TAX_RATE = 0.1;

let seq = 0;
export function newId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq.toString(36)}`;
}

export function emptyTr(): MenuTr {
  return { en: "", zh: "", ko: "" };
}

export function emptyItem(id: string): MenuItem {
  return {
    id,
    name: "",
    tr: emptyTr(),
    price: "",
    tilde: false,
    reco: false,
    spicy: false,
    veg: false,
  };
}

export function emptyCategory(id: string, itemId: string): MenuCategory {
  return { id, name: "", tr: emptyTr(), items: [emptyItem(itemId)] };
}

export function getDefaultData(): MenuI18nData {
  return {
    shopName: "",
    titleKind: "menu",
    langs: { en: true, zh: true, ko: true },
    inputMode: "incl",
    showTaxLabel: true,
    style: "simple",
    categories: [emptyCategory("c1", "i1")],
  };
}

export function enabledLangs(data: MenuI18nData): LangCode[] {
  return LANGS.map((l) => l.code).filter((c) => data.langs[c]);
}

/** 辞書ヒット時、空欄の訳だけ埋めたtrを返す(手入力は上書きしない)。変化がなければnull */
export function autoFillTr(ja: string, tr: MenuTr): MenuTr | null {
  const hit = lookupJa(ja);
  if (!hit) return null;
  const next: MenuTr = { ...tr };
  let changed = false;
  for (const code of ["en", "zh", "ko"] as const) {
    if (!next[code].trim() && hit[code]) {
      next[code] = hit[code];
      changed = true;
    }
  }
  return changed ? next : null;
}

// ---- 価格の解釈・整形(price-listと同一ロジック) ----
export function parsePriceNumber(raw: string): number | null {
  const normalized = raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[¥￥,，\s円]/g, "");
  if (normalized === "" || !/^\d+$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function formatDisplayPrice(
  raw: string,
  tilde: boolean,
  inputMode: MenuInputMode
): { text: string; isNumeric: boolean } {
  const n = parsePriceNumber(raw);
  if (n === null) {
    const t = raw.trim();
    return { text: t + (t && tilde ? "〜" : ""), isNumeric: false };
  }
  const incl = inputMode === "incl" ? n : Math.round(n * (1 + TAX_RATE));
  return {
    text: `¥${incl.toLocaleString("ja-JP")}${tilde ? "〜" : ""}`,
    isNumeric: true,
  };
}

// ---- localStorage ----
const DRAFT_KEY = "cocoroai_tools_multilingual_menu_draft";

export function saveDraft(data: MenuI18nData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save multilingual menu draft:", error);
  }
}

export function loadDraft(): MenuI18nData | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as MenuI18nData;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to load multilingual menu draft:", error);
    return null;
  }
}

export function clearDraft(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear multilingual menu draft:", error);
  }
}
