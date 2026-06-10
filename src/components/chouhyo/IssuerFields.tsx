"use client";
// 発行者(自社)情報フォーム。インボイス登録番号(T+13桁)対応
import { useState } from "react";
import Tooltip from "./Tooltip";
import { useAddressLookup } from "./useAddressLookup";
import type { Issuer, DocumentType } from "@/lib/chouhyo/types";
import { inputCls, labelCls, headingCls, helpIconCls } from "./fieldStyles";

interface Props {
  docType: DocumentType;
  issuer: Issuer;
  onChange: (issuer: Partial<Issuer>) => void;
}

export default function IssuerFields({ docType, issuer, onChange }: Props) {
  const { lookupAddress } = useAddressLookup();
  const [regNoError, setRegNoError] = useState<string>("");

  const handleZipChange = async (zip: string) => {
    onChange({ zip });
    if (zip.length === 7) {
      const address = await lookupAddress(zip);
      if (address) {
        onChange({ addr: address.fullAddress });
      }
    }
  };

  // 登録番号の処理（T + 13桁の数字）
  const handleRegNoChange = (value: string) => {
    // 数字のみを許可
    const numbersOnly = value.replace(/[^0-9]/g, "");

    // 13桁を超える入力は無視
    if (numbersOnly.length > 13) {
      return;
    }

    // Tプレフィックス付きで保存
    const regNo = numbersOnly ? `T${numbersOnly}` : "";
    onChange({ regNo });

    // バリデーション
    if (numbersOnly.length > 0 && numbersOnly.length !== 13) {
      setRegNoError("登録番号は13桁の数字で入力してください");
    } else {
      setRegNoError("");
    }
  };

  // 表示用：Tを除いた数字部分を取得
  const getRegNoDisplayValue = () => {
    if (!issuer.regNo) return "";
    return issuer.regNo.replace(/^T/, "");
  };

  const getTitle = () => {
    const titleMap: Record<DocumentType, string> = {
      estimate: "発行者",
      invoice: "発行者",
      purchaseOrder: "発注者",
      receipt: "発行者",
    };
    return titleMap[docType] || "発行者";
  };

  const tooltipContent =
    docType === "purchaseOrder" ? "仕事を依頼し、代金を支払う側です" : null;

  return (
    <div className="space-y-3">
      <h3 className={`flex items-center gap-1 ${headingCls}`}>
        {getTitle()}
        {tooltipContent && (
          <Tooltip content={tooltipContent}>
            <span className={helpIconCls}>?</span>
          </Tooltip>
        )}
      </h3>

      <div className="space-y-1">
        <label className={labelCls}>事業者名 *</label>
        <input
          type="text"
          className={inputCls}
          value={issuer.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="株式会社サンプル"
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>氏名</label>
        <input
          type="text"
          className={inputCls}
          value={issuer.personName || ""}
          onChange={(e) => onChange({ personName: e.target.value })}
          placeholder="山田 太郎"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className={labelCls}>郵便番号</label>
          <input
            type="text"
            className={inputCls}
            value={issuer.zip || ""}
            onChange={(e) => handleZipChange(e.target.value)}
            placeholder="1234567"
            maxLength={7}
            inputMode="numeric"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label className={labelCls}>住所</label>
          <input
            type="text"
            className={inputCls}
            value={issuer.addr || ""}
            onChange={(e) => onChange({ addr: e.target.value })}
            placeholder="東京都渋谷区..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>電話番号</label>
        <input
          type="tel"
          className={inputCls}
          value={issuer.tel || ""}
          onChange={(e) => onChange({ tel: e.target.value })}
          placeholder="03-1234-5678"
        />
      </div>

      {(docType === "invoice" || docType === "estimate") && (
        <div className="space-y-1">
          <label className={`flex items-center gap-1 ${labelCls}`}>
            登録番号
            <Tooltip content="適格請求書発行事業者の登録番号（T+13桁）／例：T1234567890123／未登録の場合は空欄でOKです。">
              <span className={helpIconCls}>?</span>
            </Tooltip>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink sm:left-2">
              T
            </div>
            <input
              type="text"
              className={`${inputCls} pl-7 sm:pl-6 ${
                regNoError ? "border-red-400 focus:border-red-400" : ""
              }`}
              value={getRegNoDisplayValue()}
              onChange={(e) => handleRegNoChange(e.target.value)}
              placeholder="1234567890123"
              maxLength={13}
              inputMode="numeric"
            />
          </div>
          {regNoError && <p className="mt-0.5 text-xs text-red-600">{regNoError}</p>}
        </div>
      )}
    </div>
  );
}
