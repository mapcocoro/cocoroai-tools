import type { Item } from "./types";

// 計算ユーティリティ関数

export interface CalcResult {
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export function calculateTotals(items: Item[]): CalcResult {
  const subTotal = items.reduce((acc, item) => {
    return acc + item.qty * item.unitPrice;
  }, 0);

  const taxTotal = items.reduce((acc, item) => {
    const lineTotal = item.qty * item.unitPrice;
    return acc + Math.round((lineTotal * item.taxRate) / 100);
  }, 0);

  return {
    subTotal,
    taxTotal,
    grandTotal: subTotal + taxTotal,
  };
}

// 税率別内訳(インボイス対応: 税率ごとの対象額と消費税額)
export interface TaxBreakdownEntry {
  rate: number;
  taxable: number;
  tax: number;
}

export function calculateTaxBreakdown(items: Item[]): TaxBreakdownEntry[] {
  const map = new Map<number, { taxable: number; tax: number }>();
  for (const item of items) {
    const lineTotal = item.qty * item.unitPrice;
    const rate = item.taxRate ?? 10;
    const entry = map.get(rate) ?? { taxable: 0, tax: 0 };
    entry.taxable += lineTotal;
    // calculateTotals と同じ「明細行ごとに丸め」で合算し、合計表示と必ず一致させる
    entry.tax += Math.round((lineTotal * rate) / 100);
    map.set(rate, entry);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, v]) => ({ rate, taxable: v.taxable, tax: v.tax }));
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "0";
  return Number(amount).toLocaleString("ja-JP");
}

export function formatPercent(rate: number): string {
  return `${rate}%`;
}
