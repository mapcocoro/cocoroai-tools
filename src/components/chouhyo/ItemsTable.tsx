"use client";
// 明細入力。移植元の横長グリッドはスマホで横スクロールが必要だったため、
// 1行=1カードのレスポンシブ構成に再設計(375pxでも横スクロールなし)
import type { Item, DocumentType } from "@/lib/chouhyo/types";
import { formatCurrency } from "@/lib/chouhyo/calc";
import { UNIT_OPTIONS } from "@/lib/chouhyo/types";
import { inputCls, selectCls, labelCls, headingCls, textareaCls } from "./fieldStyles";

interface Props {
  docType: DocumentType;
  items: Item[];
  onItemChange: (index: number, item: Partial<Item>) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

const autoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
};

export default function ItemsTable({
  docType,
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: Props) {
  const showDateColumn = docType === "purchaseOrder";

  return (
    <div className="space-y-3">
      <h3 className={headingCls}>明細</h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-line bg-paper-2/60 p-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <label className={labelCls}>品名・作業内容</label>
                <textarea
                  className={`${textareaCls} min-h-[40px] resize-none sm:min-h-[36px]`}
                  value={item.name || ""}
                  onChange={(e) => onItemChange(index, { name: e.target.value })}
                  placeholder="品名を入力"
                  rows={1}
                  onInput={autoGrow}
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  aria-label={`明細${index + 1}を削除`}
                  className="mt-5 h-8 w-8 shrink-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className={labelCls}>摘要</label>
              <textarea
                className={`${textareaCls} min-h-[40px] resize-none sm:min-h-[36px]`}
                value={item.desc || ""}
                onChange={(e) => onItemChange(index, { desc: e.target.value })}
                placeholder="摘要(任意)"
                rows={1}
                onInput={autoGrow}
              />
            </div>

            {showDateColumn && (
              <div className="space-y-1">
                <label className={labelCls}>納期</label>
                <input
                  type="date"
                  className={inputCls}
                  value={item.date || ""}
                  onChange={(e) => onItemChange(index, { date: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="space-y-1">
                <label className={labelCls}>数量</label>
                <input
                  type="number"
                  className={`${inputCls} text-right`}
                  value={item.qty || 1}
                  onChange={(e) =>
                    onItemChange(index, { qty: Number(e.target.value) || 1 })
                  }
                  min="1"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>単位</label>
                <select
                  className={selectCls}
                  value={item.unit || "式"}
                  onChange={(e) => onItemChange(index, { unit: e.target.value })}
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>単価(税抜)</label>
                <input
                  type="number"
                  className={`${inputCls} text-right`}
                  value={item.unitPrice || 0}
                  onChange={(e) =>
                    onItemChange(index, { unitPrice: Number(e.target.value) || 0 })
                  }
                  min="0"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>税率</label>
                <select
                  className={selectCls}
                  value={item.taxRate ?? 10}
                  onChange={(e) =>
                    onItemChange(index, { taxRate: Number(e.target.value) })
                  }
                >
                  <option value="0">0%</option>
                  <option value="8">8%</option>
                  <option value="10">10%</option>
                </select>
              </div>
            </div>

            <div className="text-right text-sm font-bold text-ink tabular-nums">
              金額 ¥{formatCurrency((item.qty || 1) * (item.unitPrice || 0))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-ink-soft hover:bg-paper-2"
      >
        + 行を追加
      </button>
    </div>
  );
}
