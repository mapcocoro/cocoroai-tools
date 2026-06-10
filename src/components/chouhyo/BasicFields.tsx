"use client";
// 基本情報(書類番号・発行日・件名・期日・支払条件)フォーム
// 見積書/請求書/領収書で共用できるよう docType で表示を切替
import Tooltip from "./Tooltip";
import type { DocumentType } from "@/lib/chouhyo/types";
import { PAYMENT_TERMS_PRESETS } from "@/lib/chouhyo/types";
import { calculateDueDate } from "@/lib/chouhyo/calculateDueDate";
import { getDocNoSample } from "@/lib/chouhyo/docNo";
import { inputCls, selectCls, labelCls, checkboxCls, helpIconCls } from "./fieldStyles";

interface Props {
  docType: DocumentType;
  docNo: string;
  subject: string;
  issueDate: string;
  dueDate?: string;
  paymentSite?: string;
  receiptPurpose?: string;
  manualPurpose?: boolean;
  onDocNoChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onIssueDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onPaymentSiteChange: (value: string) => void;
  onReceiptPurposeChange?: (value: string) => void;
  onManualPurposeChange?: (value: boolean) => void;
}

export default function BasicFields({
  docType,
  docNo,
  subject,
  issueDate,
  dueDate,
  paymentSite,
  receiptPurpose,
  manualPurpose,
  onDocNoChange,
  onSubjectChange,
  onIssueDateChange,
  onDueDateChange,
  onPaymentSiteChange,
  onReceiptPurposeChange,
  onManualPurposeChange,
}: Props) {
  const getDocNoLabel = () => {
    const labelMap: Record<DocumentType, string> = {
      estimate: "見積番号",
      invoice: "請求書番号",
      purchaseOrder: "発注番号",
      receipt: "領収書番号",
    };
    return labelMap[docType] || "書類番号";
  };

  const getIssueDateLabel = () => {
    const labelMap: Record<DocumentType, string> = {
      estimate: "見積日",
      invoice: "請求日",
      purchaseOrder: "発注日",
      receipt: "領収日",
    };
    return labelMap[docType] || "発行日";
  };

  // 見積書では dueDate を「有効期限」として扱う
  const dueDateLabel = docType === "estimate" ? "有効期限" : "支払期日";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={`flex items-center gap-1 ${labelCls}`}>
            {getDocNoLabel()} *
            <Tooltip
              content={`例：${getDocNoSample(docType)} など。自社の採番ルールでOK。重複しないようにしてください。`}
            >
              <span className={helpIconCls}>?</span>
            </Tooltip>
          </label>
          <input
            type="text"
            className={inputCls}
            value={docNo}
            onChange={(e) => onDocNoChange(e.target.value)}
            placeholder={getDocNoSample(docType)}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>{getIssueDateLabel()} *</label>
          <input
            type="date"
            className={inputCls}
            value={issueDate}
            onChange={(e) => {
              const newIssueDate = e.target.value;
              onIssueDateChange(newIssueDate);
              // 発行日を変更したときも、支払条件が設定されていれば支払期日を再計算
              if (paymentSite) {
                const calculatedDueDate = calculateDueDate(newIssueDate, paymentSite);
                if (calculatedDueDate) {
                  onDueDateChange(calculatedDueDate);
                }
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>件名 *</label>
        <input
          type="text"
          className={inputCls}
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="工事費用の件"
        />
      </div>

      {(docType === "invoice" || docType === "estimate") && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelCls}>
              {dueDateLabel}
              {docType === "invoice" ? " *" : ""}
            </label>
            <input
              type="date"
              className={inputCls}
              value={dueDate || ""}
              onChange={(e) => onDueDateChange(e.target.value)}
              required={docType === "invoice"}
            />
          </div>

          {docType === "invoice" && (
            <div className="space-y-1">
              <label className={labelCls}>支払条件</label>
              <select
                className={selectCls}
                value={paymentSite || PAYMENT_TERMS_PRESETS[0]}
                onChange={(e) => {
                  const newPaymentSite = e.target.value;
                  onPaymentSiteChange(newPaymentSite);
                  // 支払条件を選択したら自動で支払期日を計算
                  const calculatedDueDate = calculateDueDate(issueDate, newPaymentSite);
                  if (calculatedDueDate) {
                    onDueDateChange(calculatedDueDate);
                  }
                }}
              >
                {PAYMENT_TERMS_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {docType === "receipt" && (
        <div className="space-y-2">
          <label className={`flex items-center gap-2 ${labelCls}`}>
            <input
              type="checkbox"
              checked={manualPurpose || false}
              onChange={(e) => onManualPurposeChange?.(e.target.checked)}
              className={checkboxCls}
            />
            手動で但し書きを編集する
          </label>
          {manualPurpose && (
            <div className="space-y-1">
              <label className={labelCls}>但し書き</label>
              <input
                type="text"
                className={inputCls}
                value={receiptPurpose || ""}
                onChange={(e) => onReceiptPurposeChange?.(e.target.value)}
                placeholder="◯◯代として"
              />
              <p className="text-xs text-ink-mute">
                ※チェックを外すと、明細から自動生成されます
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
