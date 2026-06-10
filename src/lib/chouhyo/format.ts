// 日付・文字列フォーマットユーティリティ

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  } catch {
    return dateStr;
  }
}

export function formatZip(zip: string): string {
  if (!zip) return "";
  // 7桁郵便番号にハイフンを挿入
  if (zip.length === 7 && /^\d{7}$/.test(zip)) {
    return `〒${zip.slice(0, 3)}-${zip.slice(3)}`;
  }
  return zip.startsWith("〒") ? zip : `〒${zip}`;
}

export function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function safeNumber(value: unknown): number {
  if (value === null || value === undefined || isNaN(Number(value))) return 0;
  return Number(value);
}
