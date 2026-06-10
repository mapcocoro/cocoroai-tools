// 見積書プレビュー(印刷=この内容がそのままA4に出る)
// 移植元: kantan-chouhyo/app/components/preview/EstimatePreview.tsx
// 変更点: 印刷CSSを専用クラス(doc-root/doc-row/doc-rule-*)に付け替え、税率別内訳を追加
import type { FormData } from "@/lib/chouhyo/types";
import { formatZip } from "@/lib/chouhyo/format";
import { formatCurrency, type TaxBreakdownEntry } from "@/lib/chouhyo/calc";

interface Props {
  data: FormData;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  breakdown: TaxBreakdownEntry[];
}

const formatYMD = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

const gridCols =
  "grid-cols-[1fr_minmax(3rem,auto)_minmax(3.5rem,auto)_minmax(5.5rem,auto)_minmax(6rem,auto)]";

export default function EstimatePreview({
  data,
  subTotal,
  taxTotal,
  grandTotal,
  breakdown,
}: Props) {
  return (
    <div className="doc-root min-w-[480px] max-w-none bg-white text-sm leading-7 text-black">
      {/* ヘッダー */}
      <div className="doc-section mb-4 text-center">
        <h1 className="mb-3 font-sans text-3xl font-light tracking-wider">見積書</h1>
        <div className="mb-2 text-right text-xs text-slate-500">
          <div>書類番号：{data?.docNo || "EST-YYYYMM-001"}</div>
          <div>発行日：{formatYMD(data?.issueDate)}</div>
          {data?.dueDate && <div>有効期限：{formatYMD(data.dueDate)}</div>}
        </div>
        <div className="doc-rule-b mb-4 border-b border-slate-300"></div>
      </div>

      {/* 宛先 */}
      <div className="doc-section mb-4">
        <div className="text-base font-semibold">
          {data?.client?.name || "—"}
          {!data?.client?.personName &&
            data?.client?.honorific !== "" &&
            ` ${data?.client?.honorific || "御中"}`}
        </div>
        {data?.client?.personName && (
          <div className="text-sm">
            {data.client.personName}
            {data?.client?.honorific !== "" && ` ${data?.client?.honorific || "様"}`}
          </div>
        )}
        {data?.client?.zip && data?.client?.addr && (
          <div className="mt-2 text-sm text-slate-600">
            {formatZip(data.client.zip)}
            <br />
            {data.client.addr}
          </div>
        )}
      </div>

      {/* 件名 */}
      {data?.subject && (
        <div className="mb-4">
          <strong>件名：</strong>
          {data.subject}
        </div>
      )}

      {/* 明細テーブル - CSS Grid */}
      <div className="mb-6">
        {/* ヘッダー */}
        <div className={`grid ${gridCols} text-[12px] font-semibold tracking-wide text-slate-700`}>
          <div className="doc-rule-b border-b border-slate-300 px-2 py-2">
            品名・作業内容
          </div>
          <div className="doc-rule-b border-b border-slate-300 px-2 py-2 text-center">
            数量
          </div>
          <div className="doc-rule-b border-b border-slate-300 px-2 py-2 text-center">
            単位
          </div>
          <div className="doc-rule-b border-b border-slate-300 px-2 py-2 text-right">
            単価(税抜)
          </div>
          <div className="doc-rule-b border-b border-slate-300 px-2 py-2 text-right">
            金額(税抜)
          </div>
        </div>

        {/* 明細行 */}
        {(data?.items || []).map((item, index) => (
          <div
            key={index}
            className={`doc-row grid ${gridCols} text-[14px] text-slate-800`}
          >
            <div className="whitespace-pre-wrap break-words px-2 py-2">
              {item?.name || "—"}
              {item?.desc && (
                <div className="mt-1 text-[13px] text-slate-600">{item.desc}</div>
              )}
              {item?.date && (
                <div className="mt-1 text-[11px] text-slate-500">
                  作業日: {formatYMD(item.date)}
                </div>
              )}
            </div>
            <div className="px-2 py-2 text-center">{item?.qty || 1}</div>
            <div className="px-2 py-2 text-center text-[13px]">{item?.unit || "式"}</div>
            <div className="tnum px-2 py-2 text-right">
              ¥{formatCurrency(item?.unitPrice || 0)}
            </div>
            <div className="tnum px-2 py-2 text-right">
              ¥{formatCurrency((item?.qty || 1) * (item?.unitPrice || 0))}
            </div>
          </div>
        ))}
      </div>

      {/* 合計(税率別内訳つき・インボイス対応) */}
      <div className="doc-section mb-6 ml-auto mt-4 w-full max-w-72 space-y-1 text-sm">
        <div className="doc-rule-t flex justify-between border-t border-slate-300 pt-2">
          <span>小計(税抜)</span>
          <span className="tnum">¥{formatCurrency(subTotal)}</span>
        </div>
        {breakdown.map((b) => (
          <div key={b.rate} className="flex justify-between text-[11px] text-slate-500">
            <span>
              {b.rate}%対象 ¥{formatCurrency(b.taxable)}
            </span>
            <span className="tnum">消費税 ¥{formatCurrency(b.tax)}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span>消費税</span>
          <span className="tnum">¥{formatCurrency(taxTotal)}</span>
        </div>
        <div className="flex justify-between text-[15px] font-bold">
          <span>合計（税込）</span>
          <span className="tnum">¥{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* 発行元・振込先 */}
      <div className="doc-section mt-6 grid grid-cols-2 gap-8">
        <div>
          <div className="mb-2 font-medium">発行元</div>
          <div className="text-[10px] text-slate-500">
            <div className="text-sm font-medium text-black">
              {data?.issuer?.name || "—"}
            </div>
            {data?.issuer?.personName && (
              <div className="text-sm text-black">{data.issuer.personName}</div>
            )}
            {data?.issuer?.zip && data?.issuer?.addr && (
              <div className="mt-1">
                {formatZip(data.issuer.zip)}
                <br />
                {data.issuer.addr}
              </div>
            )}
            {data?.issuer?.tel && <div className="mt-1">TEL: {data.issuer.tel}</div>}
            {data?.issuer?.regNo && (
              <div className="mt-1">登録番号: {data.issuer.regNo}</div>
            )}
          </div>
        </div>

        {data?.bank && (data?.bank?.name || data?.bank?.number || data?.bank?.holder) && (
          <div>
            <div className="mb-2 font-medium">振込先</div>
            <div className="text-xs leading-6 text-slate-700">
              {data?.bank?.name && <div>銀行名：{data.bank.name}</div>}
              {data?.bank?.branch && <div>支店名：{data.bank.branch}</div>}
              {data?.bank?.type && <div>口座種別：{data.bank.type}</div>}
              {data?.bank?.number && <div>口座番号：{data.bank.number}</div>}
              {data?.bank?.holder && <div>口座名義：{data.bank.holder}</div>}
            </div>
          </div>
        )}
      </div>

      {/* 備考 */}
      {data?.memo?.trim() && (
        <div className="doc-section mb-4 mt-6">
          <div className="mb-2 font-medium">備考</div>
          <p className="prose-jp text-sm">{data.memo.trim()}</p>
        </div>
      )}

      {/* 特約フッター */}
      {data?.terms?.enabled && data?.terms?.text?.trim() && (
        <div className="doc-section mt-8">
          <p
            className="prose-jp text-[11px] leading-relaxed text-slate-500"
            style={{ whiteSpace: "normal", wordBreak: "break-word" }}
          >
            {data.terms.text.trim()}
          </p>
        </div>
      )}
    </div>
  );
}
