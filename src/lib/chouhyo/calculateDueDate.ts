// 支払条件から支払期日を計算する関数
export function calculateDueDate(issueDate: string, paymentTerms: string): string {
  if (!issueDate || !paymentTerms) return "";

  const date = new Date(issueDate);

  switch (paymentTerms) {
    case "月末締め、翌月末払い":
      // 翌月の末日を取得
      date.setMonth(date.getMonth() + 2, 0);
      break;

    case "月末締め、翌月10日払い":
      // 翌月の10日
      date.setMonth(date.getMonth() + 1, 10);
      break;

    case "月末締め、翌々月末払い":
      // 翌々月の末日を取得
      date.setMonth(date.getMonth() + 3, 0);
      break;

    case "検収完了後7日以内支払い":
    case "納品後7日以内支払い":
      // 7日後
      date.setDate(date.getDate() + 7);
      break;

    case "検収完了後30日以内支払い":
    case "納品後30日以内支払い":
      // 30日後
      date.setDate(date.getDate() + 30);
      break;

    case "前払い（着手金）〇％・残金：納品時":
      // 発行日と同日（前払い）
      break;

    case "その他（自由入力）":
      // 自動計算なし
      return "";

    default:
      return "";
  }

  // YYYY-MM-DD形式で返す
  return date.toISOString().split("T")[0];
}

// 発注書の支払条件から支払期限を計算する関数
import type { OrderTerms } from "./types";

export function calculateOrderDueDate(
  issueDate: string,
  payment: OrderTerms["payment"]
): string {
  if (!issueDate || !payment) return "";

  const date = new Date(issueDate);

  switch (payment.type) {
    case "site_30":
      // 月末締め・翌月末払い
      date.setMonth(date.getMonth() + 2, 0);
      break;

    case "site_60":
      // 月末締め・翌々月末払い
      date.setMonth(date.getMonth() + 3, 0);
      break;

    case "days_after": {
      // 検収後◯日以内
      const days = payment.days || 30;
      date.setDate(date.getDate() + days);
      break;
    }

    case "on_delivery":
      // 納品時支払 - 発行日と同日
      break;

    case "per_delivery":
      // 都度払い - 自動計算なし
      return "";

    default:
      return "";
  }

  // YYYY-MM-DD形式で返す
  return date.toISOString().split("T")[0];
}
