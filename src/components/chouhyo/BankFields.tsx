"use client";
// 振込先情報フォーム(見積書・請求書のみ表示)
import type { Bank, DocumentType } from "@/lib/chouhyo/types";
import { inputCls, selectCls, labelCls, headingCls } from "./fieldStyles";

interface Props {
  docType: DocumentType;
  bank?: Bank;
  onChange: (bank: Partial<Bank>) => void;
}

export default function BankFields({ docType, bank, onChange }: Props) {
  // 銀行情報は請求書と見積書のみ表示
  if (docType !== "invoice" && docType !== "estimate") {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className={headingCls}>振込先情報</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>銀行名</label>
          <input
            type="text"
            className={inputCls}
            value={bank?.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="みずほ銀行"
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>支店名</label>
          <input
            type="text"
            className={inputCls}
            value={bank?.branch || ""}
            onChange={(e) => onChange({ branch: e.target.value })}
            placeholder="渋谷支店"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>口座種別</label>
          <select
            className={selectCls}
            value={bank?.type || "普通"}
            onChange={(e) => onChange({ type: e.target.value })}
          >
            <option value="普通">普通</option>
            <option value="当座">当座</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>口座番号</label>
          <input
            type="text"
            className={inputCls}
            value={bank?.number || ""}
            onChange={(e) => onChange({ number: e.target.value })}
            placeholder="1234567"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>口座名義</label>
        <input
          type="text"
          className={inputCls}
          value={bank?.holder || ""}
          onChange={(e) => onChange({ holder: e.target.value })}
          placeholder="カ）サンプル"
        />
      </div>
    </div>
  );
}
