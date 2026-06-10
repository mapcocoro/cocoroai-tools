import type { Item } from "./types";

// 計算ユーティリティ関数

export interface CalcResult {
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
}

// 税率別内訳(インボイス対応: 税率ごとの対象額と消費税額)
export interface TaxBreakdownEntry {
  rate: number;
  taxable: number;
  tax: number;
}

/**
 * インボイス制度の端数処理要件:
 * 消費税額の端数処理は「一の適格請求書につき、税率ごとに1回」(国税庁インボイスQ&A 問57)。
 * 明細行ごとに丸めて合算する方式は認められないため、
 * 税率ごとに対象額を合計してから1回だけ丸める。
 */
export function calculateTaxBreakdown(items: Item[]): TaxBreakdownEntry[] {
  const taxableByRate = new Map<number, number>();
  for (const item of items) {
    const lineTotal = item.qty * item.unitPrice;
    const rate = item.taxRate ?? 10;
    taxableByRate.set(rate, (taxableByRate.get(rate) ?? 0) + lineTotal);
  }
  return [...taxableByRate.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, taxable]) => ({
      rate,
      taxable,
      tax: Math.round((taxable * rate) / 100),
    }));
}

export function calculateTotals(items: Item[]): CalcResult {
  // 合計は税率別内訳から導出し、内訳表示と必ず一致させる
  const breakdown = calculateTaxBreakdown(items);
  const subTotal = breakdown.reduce((acc, e) => acc + e.taxable, 0);
  const taxTotal = breakdown.reduce((acc, e) => acc + e.tax, 0);
  return {
    subTotal,
    taxTotal,
    grandTotal: subTotal + taxTotal,
  };
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "0";
  return Number(amount).toLocaleString("ja-JP");
}

export function formatPercent(rate: number): string {
  return `${rate}%`;
}
