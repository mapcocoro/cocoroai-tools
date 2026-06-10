"use client";
// 宛先(取引先)情報フォーム
import Tooltip from "./Tooltip";
import { useAddressLookup } from "./useAddressLookup";
import type { Client, DocumentType } from "@/lib/chouhyo/types";
import { HONORIFIC_OPTIONS } from "@/lib/chouhyo/types";
import { inputCls, selectCls, labelCls, headingCls, helpIconCls } from "./fieldStyles";

interface Props {
  docType: DocumentType;
  client: Client;
  onChange: (client: Partial<Client>) => void;
}

export default function ClientFields({ docType, client, onChange }: Props) {
  const { lookupAddress } = useAddressLookup();

  const handleZipChange = async (zip: string) => {
    onChange({ zip });
    if (zip.length === 7) {
      const address = await lookupAddress(zip);
      if (address) {
        onChange({ addr: address.fullAddress });
      }
    }
  };

  const getTitle = () => {
    const titleMap: Record<DocumentType, string> = {
      estimate: "提出先",
      invoice: "請求先",
      purchaseOrder: "受注者",
      receipt: "宛名",
    };
    return titleMap[docType] || "取引先";
  };

  const tooltipContent =
    docType === "purchaseOrder" ? "仕事を受け、代金を受け取る側です" : null;

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

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1">
          <label className={labelCls}>事業者名 *</label>
          <input
            type="text"
            className={inputCls}
            value={client.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="株式会社クライアント"
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>敬称</label>
          <select
            className={selectCls}
            value={client.honorific ?? "御中"}
            onChange={(e) => onChange({ honorific: e.target.value })}
          >
            {HONORIFIC_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option || "（なし）"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>氏名</label>
        <input
          type="text"
          className={inputCls}
          value={client.personName || ""}
          onChange={(e) => onChange({ personName: e.target.value })}
          placeholder="田中 一郎"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className={labelCls}>郵便番号</label>
          <input
            type="text"
            className={inputCls}
            value={client.zip || ""}
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
            value={client.addr || ""}
            onChange={(e) => onChange({ addr: e.target.value })}
            placeholder="東京都渋谷区..."
          />
        </div>
      </div>
    </div>
  );
}
