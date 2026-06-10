"use client";
// かんたん見積書 本体
// 移植元: kantan-chouhyo/app/app/page.tsx を見積書専用に簡素化
// (帳票種別切替・発注書ロジックは省略。請求書・領収書ツールで部品を再利用予定)
import { useEffect, useMemo, useState } from "react";
import type { FormData, Item } from "@/lib/chouhyo/types";
import { DEFAULT_TERMS_TEXT } from "@/lib/chouhyo/types";
import { calculateTotals, calculateTaxBreakdown } from "@/lib/chouhyo/calc";
import { allocateDocNo, recordDocNoIfValid, getDocNoSample } from "@/lib/chouhyo/docNo";
import {
  saveDraftData,
  loadDraftData,
  clearDraftData,
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
import EstimatePreview from "@/components/chouhyo/EstimatePreview";
import { textareaCls, labelCls, checkboxCls } from "@/components/chouhyo/fieldStyles";

const DEFAULT_MEMO = `有効期限：発行日より1ヶ月

・本見積の内容は諸条件により変更となる場合がございます。
・ご不明な点がございましたらお気軽にお問い合わせください。`;

// ---- 初期値（サーバーとクライアントで常に同じ値） ----
function getDefaultState(): FormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    docType: "estimate",
    docNo: getDocNoSample("estimate"),
    subject: "",
    issueDate: today,
    issuer: { name: "", zip: "", addr: "", tel: "", regNo: "" },
    client: { name: "", zip: "", addr: "", honorific: "御中" },
    paymentSite: "",
    dueDate: "",
    bank: { name: "", branch: "", type: "普通", number: "", holder: "" },
    memo: DEFAULT_MEMO,
    items: [{ name: "", desc: "", qty: 1, unit: "式", unitPrice: 0, taxRate: 10 }],
    terms: {
      enabled: false,
      text: DEFAULT_TERMS_TEXT,
    },
  };
}

export default function EstimateTool() {
  const [state, setState] = useState<FormData>(getDefaultState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveClientDisabled, setLocalSaveClientDisabled] = useState(false);

  // マウント時にlocalStorageから復元
  // 1) 下書き全体(リロードで入力内容を復元)
  // 2) 下書きが無ければ 自社情報/取引先/振込先 のみ復元
  useEffect(() => {
    setLocalSaveClientDisabled(isSaveClientDisabled());

    const draft = loadDraftData();
    if (draft && draft.docType === "estimate") {
      setState((prev) => ({ ...prev, ...draft, docType: "estimate" }));
    } else {
      const savedIssuer = loadIssuerSettings();
      const savedClient = loadClientSettings();
      const savedBank = loadBankSettings();
      setState((prev) => ({
        ...prev,
        issuer: savedIssuer || prev.issuer,
        client: savedClient || prev.client,
        bank: savedBank || prev.bank,
      }));
    }

    setIsInitialized(true);
  }, []);

  // 初期表示時に自動採番（サンプル値のままなら）
  useEffect(() => {
    if (!isInitialized) return;
    setState((prev) => {
      const sample = getDocNoSample("estimate");
      if (prev.docNo && prev.docNo !== sample) {
        return prev;
      }
      return { ...prev, docNo: allocateDocNo("estimate", prev.issueDate) };
    });
  }, [isInitialized]);

  // 状態変更時に自動保存(下書き全体 + 自社/取引先/振込先)
  useEffect(() => {
    if (!isInitialized) return;

    // 下書き全体(取引先保存が無効なら取引先を除いて保存)
    saveDraftData(
      saveClientDisabled
        ? { ...state, client: { name: "", zip: "", addr: "", honorific: "御中" } }
        : state
    );

    if (state.issuer?.name) {
      saveIssuerSettings(state.issuer);
    }
    if (!saveClientDisabled && state.client?.name) {
      saveClientSettings(state.client);
    }
    if (state.bank?.name || state.bank?.number || state.bank?.holder) {
      saveBankSettings(state.bank);
    }
  }, [state, isInitialized, saveClientDisabled]);

  // ---- ハンドラ（差分更新のユーティリティ） ----
  const onChange = (patch: Partial<FormData>) => {
    setState((prev) => {
      if (typeof patch.docNo === "string") {
        recordDocNoIfValid(prev.docType, patch.docNo);
      }
      return { ...prev, ...patch };
    });
  };
  const onChangeIssuer = (patch: Partial<FormData["issuer"]>) =>
    setState((s) => ({ ...s, issuer: { ...s.issuer, ...patch } }));
  const onChangeClient = (patch: Partial<FormData["client"]>) =>
    setState((s) => ({ ...s, client: { ...s.client, ...patch } }));
  const onChangeBank = (patch: Partial<FormData["bank"]>) =>
    setState((s) => ({ ...s, bank: { ...s.bank, ...patch } as FormData["bank"] }));
  const onChangeItem = (index: number, patch: Partial<Item>) =>
    setState((s) => {
      const items = [...s.items];
      items[index] = { ...items[index], ...patch };
      return { ...s, items };
    });
  const onAddItem = () =>
    setState((s) => ({
      ...s,
      items: [...s.items, { name: "", desc: "", qty: 1, unit: "式", unitPrice: 0, taxRate: 10 }],
    }));
  const onRemoveItem = (index: number) =>
    setState((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));

  // 新規作成（発行元情報は保持）
  const handleNewDocument = () => {
    if (!confirm("現在の入力内容をクリアして新規作成しますか？\n※発行元情報は保持されます")) {
      return;
    }
    clearDraftData();
    const savedIssuer = loadIssuerSettings() || state.issuer;
    const today = new Date().toISOString().slice(0, 10);
    const next = getDefaultState();
    setState({
      ...next,
      docNo: allocateDocNo("estimate", today),
      issuer: savedIssuer,
    });
  };

  // 取引先情報をクリア
  const handleClearClient = () => {
    clearClientSettings();
    setState((s) => ({ ...s, client: { name: "", zip: "", addr: "", honorific: "御中" } }));
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
      {/* フォーム側(印刷時は非表示) */}
      <section className="no-print">
        <div className="rounded-2xl border border-line bg-card shadow-xs">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
            <h2 className="text-sm font-bold text-ink">見積書の内容</h2>
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
              docType="estimate"
              docNo={state.docNo}
              subject={state.subject}
              issueDate={state.issueDate}
              dueDate={state.dueDate}
              paymentSite={state.paymentSite}
              onDocNoChange={(docNo) => onChange({ docNo })}
              onSubjectChange={(subject) => onChange({ subject })}
              onIssueDateChange={(issueDate) => onChange({ issueDate })}
              onDueDateChange={(dueDate) => onChange({ dueDate })}
              onPaymentSiteChange={(paymentSite) => onChange({ paymentSite })}
            />

            <IssuerFields docType="estimate" issuer={state.issuer} onChange={onChangeIssuer} />

            <ClientFields docType="estimate" client={state.client} onChange={onChangeClient} />

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
              docType="estimate"
              items={state.items}
              onItemChange={onChangeItem}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />

            <BankFields docType="estimate" bank={state.bank} onChange={onChangeBank} />

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
        id="estimate-preview"
        className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
      >
        <PreviewPanel>
          <EstimatePreview
            data={state}
            subTotal={subTotal}
            taxTotal={taxTotal}
            grandTotal={grandTotal}
            breakdown={breakdown}
          />
        </PreviewPanel>
      </aside>

      {/* モバイル用プレビューへのジャンプボタン */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("estimate-preview")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="no-print fixed bottom-5 right-5 z-20 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white shadow-lg lg:hidden"
      >
        ↓ プレビューへ
      </button>
    </div>
  );
}
