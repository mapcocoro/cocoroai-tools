"use client";
// 請求書・領収書メーカー 本体
// 構成は estimate/EstimateTool.tsx と同じ(広幅ブレイクアウト+左フォーム/右プレビュー)。
// 上部タブで請求書/領収書を切替。入力中データは帳票種別ごとのlocalStorageキーに保存し、
// 見積書ツール(cocoroai_tools_chouhyo_draft)とも互いに干渉しない。
import { useEffect, useMemo, useState } from "react";
import type { FormData, Item } from "@/lib/chouhyo/types";
import { DEFAULT_TERMS_TEXT, DOC_LABELS } from "@/lib/chouhyo/types";
import { calculateTotals, calculateTaxBreakdown } from "@/lib/chouhyo/calc";
import { allocateDocNo, recordDocNoIfValid, getDocNoSample } from "@/lib/chouhyo/docNo";
import {
  saveDraftDataFor,
  loadDraftDataFor,
  clearDraftDataFor,
  saveIssuerSettings,
  loadIssuerSettings,
  saveClientSettings,
  loadClientSettings,
  clearClientSettings,
  isSaveClientDisabled,
  setSaveClientDisabled,
  saveBankSettings,
  loadBankSettings,
} from "@/lib/chouhyo/storage";
import BasicFields from "@/components/chouhyo/BasicFields";
import IssuerFields from "@/components/chouhyo/IssuerFields";
import ClientFields from "@/components/chouhyo/ClientFields";
import ItemsTable from "@/components/chouhyo/ItemsTable";
import BankFields from "@/components/chouhyo/BankFields";
import TermsFields from "@/components/chouhyo/TermsFields";
import PreviewPanel from "@/components/chouhyo/PreviewPanel";
import InvoicePreview from "@/components/chouhyo/InvoicePreview";
import ReceiptPreview from "@/components/chouhyo/ReceiptPreview";
import { textareaCls, labelCls, checkboxCls } from "@/components/chouhyo/fieldStyles";

type TabType = "invoice" | "receipt";
const TAB_TYPES: TabType[] = ["invoice", "receipt"];

const DEFAULT_MEMO: Record<TabType, string> = {
  invoice: "お振込手数料は恐れ入りますが貴社にてご負担をお願いいたします。",
  receipt: "",
};

const emptyClient = (): FormData["client"] => ({
  name: "",
  zip: "",
  addr: "",
  honorific: "御中",
});

// ---- 初期値（サーバーとクライアントで常に同じ値） ----
function getDefaultState(docType: TabType): FormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    docType,
    docNo: getDocNoSample(docType),
    subject: "",
    issueDate: today,
    issuer: { name: "", zip: "", addr: "", tel: "", regNo: "" },
    client: emptyClient(),
    paymentSite: "",
    dueDate: "",
    receiptPurpose: "",
    manualPurpose: false,
    bank: { name: "", branch: "", type: "普通", number: "", holder: "" },
    memo: DEFAULT_MEMO[docType],
    items: [{ name: "", desc: "", qty: 1, unit: "式", unitPrice: 0, taxRate: 10 }],
    terms: {
      enabled: false,
      text: DEFAULT_TERMS_TEXT,
    },
  };
}

export default function InvoiceReceiptTool() {
  const [docType, setDocType] = useState<TabType>("invoice");
  const [states, setStates] = useState<Record<TabType, FormData>>({
    invoice: getDefaultState("invoice"),
    receipt: getDefaultState("receipt"),
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveClientDisabled, setLocalSaveClientDisabled] = useState(false);

  const state = states[docType];

  // 現在のタブの帳票だけを差分更新するユーティリティ
  const updateActive = (updater: (prev: FormData) => FormData) => {
    setStates((all) => ({ ...all, [docType]: updater(all[docType]) }));
  };

  // マウント時にlocalStorageから復元
  // 1) 帳票別下書き(リロードで入力内容を復元)
  // 2) 下書きが無ければ 自社情報/取引先/振込先 のみ復元
  useEffect(() => {
    setLocalSaveClientDisabled(isSaveClientDisabled());

    setStates((prev) => {
      const next = { ...prev };
      for (const t of TAB_TYPES) {
        const draft = loadDraftDataFor(t);
        if (draft && draft.docType === t) {
          next[t] = { ...prev[t], ...draft, docType: t };
        } else {
          const savedIssuer = loadIssuerSettings();
          const savedClient = loadClientSettings();
          const savedBank = loadBankSettings();
          next[t] = {
            ...prev[t],
            issuer: savedIssuer || prev[t].issuer,
            client: savedClient || prev[t].client,
            bank: savedBank || prev[t].bank,
          };
        }
      }
      return next;
    });

    setIsInitialized(true);
  }, []);

  // アクティブなタブの帳票番号を自動採番（サンプル値のままなら）
  // ※未使用の帳票の番号を消費しないよう、タブが開かれたタイミングで採番する
  useEffect(() => {
    if (!isInitialized) return;
    setStates((all) => {
      const prev = all[docType];
      const sample = getDocNoSample(docType);
      if (prev.docNo && prev.docNo !== sample) {
        return all;
      }
      return {
        ...all,
        [docType]: { ...prev, docNo: allocateDocNo(docType, prev.issueDate) },
      };
    });
  }, [isInitialized, docType]);

  // 状態変更時に自動保存(帳票別下書き + 自社/取引先/振込先)
  useEffect(() => {
    if (!isInitialized) return;

    for (const t of TAB_TYPES) {
      // 下書き(取引先保存が無効なら取引先を除いて保存)
      saveDraftDataFor(
        t,
        saveClientDisabled ? { ...states[t], client: emptyClient() } : states[t]
      );
    }

    const active = states[docType];
    if (active.issuer?.name) {
      saveIssuerSettings(active.issuer);
    }
    if (!saveClientDisabled && active.client?.name) {
      saveClientSettings(active.client);
    }
    if (active.bank?.name || active.bank?.number || active.bank?.holder) {
      saveBankSettings(active.bank);
    }
  }, [states, isInitialized, saveClientDisabled, docType]);

  // タブ切替(切替先が空なら保存済みの自社/取引先/振込先を補完)
  const handleSwitchTab = (t: TabType) => {
    if (t === docType) return;
    setDocType(t);
    setStates((all) => {
      const cur = all[t];
      const patch: Partial<FormData> = {};
      if (!cur.issuer?.name) {
        const saved = loadIssuerSettings();
        if (saved) patch.issuer = saved;
      }
      if (!saveClientDisabled && !cur.client?.name) {
        const saved = loadClientSettings();
        if (saved) patch.client = saved;
      }
      if (!(cur.bank?.name || cur.bank?.number || cur.bank?.holder)) {
        const saved = loadBankSettings();
        if (saved) patch.bank = saved;
      }
      if (Object.keys(patch).length === 0) return all;
      return { ...all, [t]: { ...cur, ...patch } };
    });
  };

  // ---- ハンドラ（差分更新のユーティリティ） ----
  const onChange = (patch: Partial<FormData>) => {
    updateActive((prev) => {
      if (typeof patch.docNo === "string") {
        recordDocNoIfValid(prev.docType, patch.docNo);
      }
      return { ...prev, ...patch };
    });
  };
  const onChangeIssuer = (patch: Partial<FormData["issuer"]>) =>
    updateActive((s) => ({ ...s, issuer: { ...s.issuer, ...patch } }));
  const onChangeClient = (patch: Partial<FormData["client"]>) =>
    updateActive((s) => ({ ...s, client: { ...s.client, ...patch } }));
  const onChangeBank = (patch: Partial<FormData["bank"]>) =>
    updateActive((s) => ({ ...s, bank: { ...s.bank, ...patch } as FormData["bank"] }));
  const onChangeItem = (index: number, patch: Partial<Item>) =>
    updateActive((s) => {
      const items = [...s.items];
      items[index] = { ...items[index], ...patch };
      return { ...s, items };
    });
  const onAddItem = () =>
    updateActive((s) => ({
      ...s,
      items: [...s.items, { name: "", desc: "", qty: 1, unit: "式", unitPrice: 0, taxRate: 10 }],
    }));
  const onRemoveItem = (index: number) =>
    updateActive((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));

  // 新規作成（発行元情報は保持・現在のタブのみクリア）
  const handleNewDocument = () => {
    if (
      !confirm(
        `現在の${DOC_LABELS[docType]}の入力内容をクリアして新規作成しますか？\n※発行元情報は保持されます`
      )
    ) {
      return;
    }
    clearDraftDataFor(docType);
    const savedIssuer = loadIssuerSettings() || state.issuer;
    const today = new Date().toISOString().slice(0, 10);
    const next = getDefaultState(docType);
    setStates((all) => ({
      ...all,
      [docType]: {
        ...next,
        docNo: allocateDocNo(docType, today),
        issuer: savedIssuer,
      },
    }));
  };

  // 取引先情報をクリア
  const handleClearClient = () => {
    clearClientSettings();
    updateActive((s) => ({ ...s, client: emptyClient() }));
  };

  // 取引先情報保存の有効/無効切り替え
  const handleToggleSaveClient = (disabled: boolean) => {
    setSaveClientDisabled(disabled);
    setLocalSaveClientDisabled(disabled);
  };

  // ---- 集計（税率混在も考慮） ----
  const { subTotal, taxTotal, grandTotal } = useMemo(
    () => calculateTotals(state.items),
    [state.items]
  );
  const breakdown = useMemo(() => calculateTaxBreakdown(state.items), [state.items]);

  return (
    // ToolLayoutのmax-w-4xlだとプレビューが窮屈なため、このツールだけ広幅にブレイクアウト
    // (印刷時はtransformが#print-areaの基準枠になるのを避けるため解除)
    <div className="relative left-1/2 grid w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-1 gap-6 lg:grid-cols-2 print:static print:left-0 print:w-auto print:translate-x-0">
      {/* 帳票切替タブ */}
      <div className="no-print lg:col-span-2">
        <div
          role="tablist"
          aria-label="作成する帳票の種類"
          className="inline-flex w-full rounded-xl border border-line bg-card p-1 shadow-xs sm:w-auto"
        >
          {TAB_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={docType === t}
              onClick={() => handleSwitchTab(t)}
              className={`flex-1 rounded-lg px-6 py-2 text-sm font-bold transition-colors sm:flex-none ${
                docType === t
                  ? "bg-teal text-white"
                  : "text-ink-soft hover:bg-paper-2 hover:text-ink"
              }`}
            >
              {DOC_LABELS[t]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-mute">
          ※入力内容は帳票ごとに自動保存されます。タブを切り替えても消えません。
        </p>
      </div>

      {/* フォーム側(印刷時は非表示) */}
      <section className="no-print">
        <div className="rounded-2xl border border-line bg-card shadow-xs">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
            <h2 className="text-sm font-bold text-ink">{DOC_LABELS[docType]}の内容</h2>
            <button
              type="button"
              onClick={handleNewDocument}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs text-ink-soft transition-colors hover:bg-paper-2"
            >
              新規作成
            </button>
          </div>

          <div className="space-y-6 p-4">
            <BasicFields
              docType={docType}
              docNo={state.docNo}
              subject={state.subject}
              issueDate={state.issueDate}
              dueDate={state.dueDate}
              paymentSite={state.paymentSite}
              receiptPurpose={state.receiptPurpose}
              manualPurpose={state.manualPurpose}
              onDocNoChange={(docNo) => onChange({ docNo })}
              onSubjectChange={(subject) => onChange({ subject })}
              onIssueDateChange={(issueDate) => onChange({ issueDate })}
              onDueDateChange={(dueDate) => onChange({ dueDate })}
              onPaymentSiteChange={(paymentSite) => onChange({ paymentSite })}
              onReceiptPurposeChange={(receiptPurpose) => onChange({ receiptPurpose })}
              onManualPurposeChange={(manualPurpose) => onChange({ manualPurpose })}
            />

            <IssuerFields docType={docType} issuer={state.issuer} onChange={onChangeIssuer} />

            <ClientFields docType={docType} client={state.client} onChange={onChangeClient} />

            {/* 取引先情報の管理オプション */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex cursor-pointer items-center gap-1.5 text-ink-soft">
                <input
                  type="checkbox"
                  checked={saveClientDisabled}
                  onChange={(e) => handleToggleSaveClient(e.target.checked)}
                  className={checkboxCls}
                />
                取引先情報を保存しない
              </label>
              <button
                type="button"
                onClick={handleClearClient}
                className="text-ink-mute underline underline-offset-2 transition-colors hover:text-red-600"
              >
                取引先をクリア
              </button>
              <span className="text-[10px] text-ink-mute">
                ※共有PCでは情報を削除してください
              </span>
            </div>

            <ItemsTable
              docType={docType}
              items={state.items}
              onItemChange={onChangeItem}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />

            {/* 振込先(請求書のみ。BankFields側でも領収書では非表示) */}
            <BankFields docType={docType} bank={state.bank} onChange={onChangeBank} />

            {/* メモ欄 */}
            <div className="space-y-1">
              <label className={labelCls}>備考・メモ</label>
              <textarea
                className={`${textareaCls} min-h-[80px]`}
                value={state.memo || ""}
                onChange={(e) => onChange({ memo: e.target.value })}
                placeholder="その他特記事項があればご記入ください"
              />
            </div>

            <TermsFields terms={state.terms} onChange={(terms) => onChange({ terms })} />
          </div>
        </div>
      </section>

      {/* プレビュー側 */}
      <aside
        id="invoice-receipt-preview"
        className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
      >
        <PreviewPanel>
          {docType === "invoice" ? (
            <InvoicePreview
              data={state}
              subTotal={subTotal}
              taxTotal={taxTotal}
              grandTotal={grandTotal}
              breakdown={breakdown}
            />
          ) : (
            <ReceiptPreview
              data={state}
              subTotal={subTotal}
              taxTotal={taxTotal}
              grandTotal={grandTotal}
              breakdown={breakdown}
            />
          )}
        </PreviewPanel>

        {/* 収入印紙の案内(領収書・受取金額5万円以上のとき) */}
        {docType === "receipt" && grandTotal >= 50000 && (
          <p className="no-print mt-3 rounded-lg border border-sun/60 bg-sun/10 px-3 py-2 text-xs leading-relaxed text-ink-soft">
            ※受取金額が5万円以上の<strong className="font-bold">紙の領収書</strong>
            には収入印紙(200円〜)の貼付が必要です。PDFをメールで送るなど
            <strong className="font-bold">電子発行の場合は収入印紙は不要</strong>です。
          </p>
        )}
      </aside>

      {/* モバイル用プレビューへのジャンプボタン */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("invoice-receipt-preview")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="no-print fixed bottom-5 right-5 z-20 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white shadow-lg lg:hidden"
      >
        ↓ プレビューへ
      </button>
    </div>
  );
}
