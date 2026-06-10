"use client";

import { useState } from "react";
import { sendFeedback } from "@/lib/feedback";
import type { ToolMeta } from "@/lib/tools";

/** 「こんな機能欲しい」ひとことフォーム(需要センサー) */
export default function FeedbackForm({ tool }: { tool: ToolMeta }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState(""); // ハニーポット
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state === "sending") return;
    setState("sending");
    await sendFeedback({ tool: tool.id, message: message.trim(), name, company });
    setState("done");
  };

  if (state === "done") {
    return (
      <section className="no-print rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-sm font-bold text-teal">
          ありがとうございます!いただいた声は次の改善に活かします。
        </p>
      </section>
    );
  }

  return (
    <section className="no-print rounded-2xl border border-line bg-card p-6 sm:p-8">
      <h2 className="font-serif text-lg font-bold text-ink">
        「こんな機能が欲しい」を教えてください
      </h2>
      <p className="mt-1 text-xs text-ink-mute">
        ひとことでOK。次のツールづくりの参考にします。
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          placeholder="例: 宛名を登録しておけるようにしてほしい"
          className="w-full rounded-lg border border-line bg-paper p-3 text-ink placeholder:text-ink-mute/60 focus:border-teal focus:outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前(任意)"
            className="w-full rounded-lg border border-line bg-paper p-3 text-ink placeholder:text-ink-mute/60 focus:border-teal focus:outline-none sm:max-w-xs"
          />
          {/* ハニーポット: 人間には見えない */}
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="shrink-0 rounded-full border border-teal px-6 py-3 text-sm font-bold text-teal transition hover:bg-teal hover:text-white disabled:opacity-50"
          >
            {state === "sending" ? "送信中..." : "送信する"}
          </button>
        </div>
      </form>
    </section>
  );
}
