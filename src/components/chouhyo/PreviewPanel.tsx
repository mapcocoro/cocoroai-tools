"use client";
// 帳票プレビュー共通パネル(印刷ボタン + #print-area)
// 見積書/請求書/領収書のどのプレビューでも children として差し込める汎用部品
import React from "react";

interface Props {
  /** 印刷前バリデーション。エラーメッセージを返すと印刷を中断してalert表示 */
  beforePrint?: () => string | null;
  children: React.ReactNode;
}

export default function PreviewPanel({ beforePrint, children }: Props) {
  const handlePrint = () => {
    const error = beforePrint?.();
    if (error) {
      alert(error);
      return;
    }
    window.print();
  };

  return (
    <div className="rounded-2xl border border-line bg-card shadow-xs print:border-0 print:bg-transparent print:shadow-none">
      {/* プレビューヘッダー */}
      <div className="no-print flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
        <h3 className="text-sm font-bold text-ink">プレビュー</h3>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-deep"
        >
          印刷・PDF保存
        </button>
      </div>

      {/* 印刷エリア(画面では横スクロール可、印刷時はA4全面) */}
      <div id="print-area" className="overflow-x-auto bg-white p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
