// LocalStorage ユーティリティ
// 移植元: kantan-chouhyo/app/lib/storage.ts
// ※キーは「しごとの小道具」用に cocoroai_tools_ プレフィックスへ変更

import type { FormData, Issuer, Client, Bank, DocumentType } from "./types";

// LocalStorageのキー名
const STORAGE_KEYS = {
  DRAFT_DATA: "cocoroai_tools_chouhyo_draft",
  ISSUER_SETTINGS: "cocoroai_tools_chouhyo_issuer",
  CLIENT_SETTINGS: "cocoroai_tools_chouhyo_client",
  BANK_SETTINGS: "cocoroai_tools_chouhyo_bank",
  SAVE_CLIENT_DISABLED: "cocoroai_tools_chouhyo_save_client_disabled",
  DOC_NO_TRACKER: "cocoroai_tools_chouhyo_doc_no_tracker",
} as const;
type DocNoTracker = Partial<Record<DocumentType, string>>;

/**
 * 現在の下書きデータを保存
 */
export function saveDraftData(data: FormData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DRAFT_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft data:", error);
  }
}

/**
 * 保存された下書きデータを読み込み
 */
export function loadDraftData(): FormData | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_DATA);
    if (!stored) return null;
    return JSON.parse(stored) as FormData;
  } catch (error) {
    console.error("Failed to load draft data:", error);
    return null;
  }
}

/**
 * 下書きデータを削除
 */
export function clearDraftData(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.DRAFT_DATA);
  } catch (error) {
    console.error("Failed to clear draft data:", error);
  }
}

// ---- 帳票種別ごとの下書きキー ----
// 見積書は従来キー(cocoroai_tools_chouhyo_draft)を継続利用。
// 請求書・領収書は帳票別キーに分離し、ツール間・タブ間でデータが混ざらないようにする
function draftKeyFor(docType: DocumentType): string {
  return docType === "estimate"
    ? STORAGE_KEYS.DRAFT_DATA
    : `${STORAGE_KEYS.DRAFT_DATA}_${docType}`;
}

/**
 * 帳票種別ごとの下書きデータを保存
 */
export function saveDraftDataFor(docType: DocumentType, data: FormData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(draftKeyFor(docType), JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft data:", error);
  }
}

/**
 * 帳票種別ごとの下書きデータを読み込み
 */
export function loadDraftDataFor(docType: DocumentType): FormData | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(draftKeyFor(docType));
    if (!stored) return null;
    return JSON.parse(stored) as FormData;
  } catch (error) {
    console.error("Failed to load draft data:", error);
    return null;
  }
}

/**
 * 帳票種別ごとの下書きデータを削除
 */
export function clearDraftDataFor(docType: DocumentType): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(draftKeyFor(docType));
  } catch (error) {
    console.error("Failed to clear draft data:", error);
  }
}

/**
 * 発行元（自社）情報のデフォルト設定を保存
 */
export function saveIssuerSettings(issuer: Issuer): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ISSUER_SETTINGS, JSON.stringify(issuer));
  } catch (error) {
    console.error("Failed to save issuer settings:", error);
  }
}

/**
 * 保存された発行元情報を読み込み
 */
export function loadIssuerSettings(): Issuer | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.ISSUER_SETTINGS);
    if (!stored) return null;
    return JSON.parse(stored) as Issuer;
  } catch (error) {
    console.error("Failed to load issuer settings:", error);
    return null;
  }
}

/**
 * 発行元情報設定を削除
 */
export function clearIssuerSettings(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.ISSUER_SETTINGS);
  } catch (error) {
    console.error("Failed to clear issuer settings:", error);
  }
}

/**
 * 取引先（クライアント）情報を保存
 */
export function saveClientSettings(client: Client): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CLIENT_SETTINGS, JSON.stringify(client));
  } catch (error) {
    console.error("Failed to save client settings:", error);
  }
}

/**
 * 保存された取引先情報を読み込み
 */
export function loadClientSettings(): Client | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENT_SETTINGS);
    if (!stored) return null;
    return JSON.parse(stored) as Client;
  } catch (error) {
    console.error("Failed to load client settings:", error);
    return null;
  }
}

/**
 * 取引先情報を削除
 */
export function clearClientSettings(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.CLIENT_SETTINGS);
  } catch (error) {
    console.error("Failed to clear client settings:", error);
  }
}

/**
 * クライアント情報保存の無効化フラグを設定
 */
export function setSaveClientDisabled(disabled: boolean): void {
  try {
    if (typeof window === "undefined") return;
    if (disabled) {
      localStorage.setItem(STORAGE_KEYS.SAVE_CLIENT_DISABLED, "true");
      // 無効にした時点で保存済みクライアント情報も削除
      clearClientSettings();
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVE_CLIENT_DISABLED);
    }
  } catch (error) {
    console.error("Failed to set save client disabled:", error);
  }
}

/**
 * クライアント情報保存が無効かどうかを取得
 */
export function isSaveClientDisabled(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.SAVE_CLIENT_DISABLED) === "true";
  } catch (error) {
    console.error("Failed to get save client disabled:", error);
    return false;
  }
}

/**
 * 振込先情報を保存
 */
export function saveBankSettings(bank: Bank): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.BANK_SETTINGS, JSON.stringify(bank));
  } catch (error) {
    console.error("Failed to save bank settings:", error);
  }
}

/**
 * 保存された振込先情報を読み込み
 */
export function loadBankSettings(): Bank | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.BANK_SETTINGS);
    if (!stored) return null;
    return JSON.parse(stored) as Bank;
  } catch (error) {
    console.error("Failed to load bank settings:", error);
    return null;
  }
}

function loadDocNoTracker(): DocNoTracker {
  try {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEYS.DOC_NO_TRACKER);
    if (!stored) return {};
    return JSON.parse(stored) as DocNoTracker;
  } catch (error) {
    console.error("Failed to load doc no tracker:", error);
    return {};
  }
}

function saveDocNoTracker(tracker: DocNoTracker): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DOC_NO_TRACKER, JSON.stringify(tracker));
  } catch (error) {
    console.error("Failed to save doc no tracker:", error);
  }
}

export function getLastDocNo(docType: DocumentType): string | undefined {
  const tracker = loadDocNoTracker();
  return tracker[docType] || undefined;
}

export function setLastDocNo(docType: DocumentType, docNo: string): void {
  const tracker = loadDocNoTracker();
  tracker[docType] = docNo;
  saveDocNoTracker(tracker);
}
