"use client";
// 簡易特約フッターフォーム
import type { Terms } from "@/lib/chouhyo/types";
import { DEFAULT_TERMS_TEXT } from "@/lib/chouhyo/types";
import { textareaCls, labelCls, headingCls, checkboxCls } from "./fieldStyles";

interface Props {
  terms?: Terms;
  onChange: (terms: Terms) => void;
}

export default function TermsFields({ terms, onChange }: Props) {
  const currentTerms = terms || { enabled: false, text: DEFAULT_TERMS_TEXT };

  return (
    <div className="space-y-3">
      <h3 className={headingCls}>簡易特約フッター</h3>

      <div className="space-y-2">
        <label className={`flex items-center gap-2 ${labelCls} cursor-pointer`}>
          <input
            type="checkbox"
            checked={currentTerms.enabled}
            onChange={(e) => onChange({ ...currentTerms, enabled: e.target.checked })}
            className={checkboxCls}
          />
          簡易特約をフッターに載せる
        </label>

        {currentTerms.enabled && (
          <div className="space-y-1">
            <label className={labelCls}>特約内容</label>
            <textarea
              className={`${textareaCls} min-h-[100px]`}
              value={currentTerms.text}
              onChange={(e) => onChange({ ...currentTerms, text: e.target.value })}
              placeholder="特約内容を入力してください"
            />
            <p className="text-xs text-ink-mute">
              ※フッターに小さな文字で表示されます。印刷時も同じサイズで出力されます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
