// げんばで見積 台帳ストレージ
// かんたん見積書(単票の下書き)と違い、複数の見積を保存して一覧・検索できる
// データはこの端末のlocalStorageのみに保存(外部送信なし)

import type { FormData } from "@/lib/chouhyo/types";

const RECORDS_KEY = "cocoroai_tools_genba_estimates";

export interface GenbaEstimateRecord {
  id: string;
  /** 最終更新日時(ISO) */
  updatedAt: string;
  data: FormData;
}

function readAll(): GenbaEstimateRecord[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(RECORDS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as GenbaEstimateRecord[]) : [];
  } catch (error) {
    console.error("Failed to load genba estimates:", error);
    return [];
  }
}

function writeAll(records: GenbaEstimateRecord[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save genba estimates:", error);
  }
}

/** 一覧(更新日時の新しい順) */
export function listRecords(): GenbaEstimateRecord[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getRecord(id: string): GenbaEstimateRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

/** 追加または上書き保存 */
export function upsertRecord(id: string, data: FormData): GenbaEstimateRecord {
  const records = readAll();
  const record: GenbaEstimateRecord = {
    id,
    updatedAt: new Date().toISOString(),
    data,
  };
  const index = records.findIndex((r) => r.id === id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  writeAll(records);
  return record;
}

export function removeRecord(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function newRecordId(): string {
  return `ge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- サンプル見積の初期投入 ----
// 初回アクセス時に1件だけ入れて「開けば使い方が分かる」状態にする。
// 削除されたら二度と復活しない(フラグで管理)
const SEEDED_KEY = "cocoroai_tools_genba_seeded_v2";

export function seedSampleIfNeeded(): void {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEDED_KEY)) return;
    localStorage.setItem(SEEDED_KEY, "1");
    // 中身のある見積が既にあればスキップ(空レコードだけならサンプルを入れてOK)
    const hasMeaningful = readAll().some(
      (r) =>
        r.data.client?.name ||
        r.data.subject ||
        r.data.items?.some((it) => it.name || (it.unitPrice ?? 0) !== 0)
    );
    if (hasMeaningful) return;

    const today = new Date().toISOString().slice(0, 10);
    const sample: FormData = {
      docType: "estimate",
      docNo: "EST-SAMPLE-001",
      subject: "【サンプル】社屋 外壁・屋根塗装工事",
      issueDate: today,
      issuer: { name: "", zip: "", addr: "", tel: "", regNo: "" },
      client: { name: "スズキ電気", zip: "", addr: "", honorific: "御中" },
      paymentSite: "",
      dueDate: "",
      bank: { name: "", branch: "", type: "普通", number: "", holder: "" },
      memo:
        "有効期限：発行日より1ヶ月\n\n※これはサンプルです。「複製して新規」で下敷きにするか、不要なら削除してください。",
      items: [
        { name: "足場設置", desc: "", qty: 150, unit: "㎡", unitPrice: 800, taxRate: 10 },
        { name: "高圧洗浄", desc: "", qty: 150, unit: "㎡", unitPrice: 300, taxRate: 10 },
        { name: "シリコン塗装（外壁）", desc: "耐久性10年", qty: 120, unit: "㎡", unitPrice: 2800, taxRate: 10 },
        { name: "シリコン塗装（屋根）", desc: "耐久性10年", qty: 60, unit: "㎡", unitPrice: 3200, taxRate: 10 },
        { name: "養生", desc: "", qty: 1, unit: "式", unitPrice: 25000, taxRate: 10 },
        { name: "出精値引き", desc: "", qty: 1, unit: "式", unitPrice: -20000, taxRate: 10 },
      ],
      terms: { enabled: false, text: "" },
    };
    writeAll([{ id: "sample_tosou", updatedAt: new Date().toISOString(), data: sample }]);
  } catch (error) {
    console.error("Failed to seed sample estimate:", error);
  }
}
