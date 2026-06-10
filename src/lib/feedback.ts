import { CONTACT_EMAIL } from "./tools";

const FEEDBACK_ENDPOINT =
  "https://cocoroai-contact.map-cocoro.workers.dev/api/contact";

export interface FeedbackPayload {
  tool: string;
  message: string;
  name?: string;
  email?: string;
  /** ハニーポット(人間は空のまま) */
  company?: string;
}

/**
 * ひとことフォーム送信。
 * Co.Link worker(改修後)にPOSTし、失敗時はmailtoにフォールバックする。
 * 戻り値: "sent"=API送信成功 / "mailto"=メーラー起動にフォールバック
 */
export async function sendFeedback(
  payload: FeedbackPayload
): Promise<"sent" | "mailto"> {
  if (payload.company) return "sent"; // bot: 黙って捨てる
  try {
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiryType: "ツール要望",
        feedbackType: "tool_feedback",
        tool: payload.tool,
        name: payload.name || "(未記入)",
        email: payload.email || "",
        message: payload.message,
      }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return "sent";
  } catch {
    const subject = encodeURIComponent(`【ツール要望】${payload.tool}`);
    const body = encodeURIComponent(
      `${payload.message}\n\n(お名前: ${payload.name || "未記入"})`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    return "mailto";
  }
}
