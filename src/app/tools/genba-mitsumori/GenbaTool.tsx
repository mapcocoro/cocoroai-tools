"use client";
// げんばで見積 本体
// かんたん見積書(estimate)の編集UIを流用し、「顧客ごとに保存して一覧・検索できる台帳」を追加したもの
// データは端末内(localStorage)のみ。現場帳デモ(genbacho)の公開簡易版
import { useEffect, useMemo, useState } from "react";
import type { FormData, Item } from "@/lib/chouhyo/types";
import { DEFAULT_TERMS_TEXT } from "@/lib/chouhyo/types";
import { calculateTotals, calculateTaxBreakdown } from "@/lib/chouhyo/calc";
import { allocateDocNo, recordDocNoIfValid, getDocNoSample } from "@/lib/chouhyo/docNo";
import {
  saveIssuerSettings,
  loadIssuerSettings,
  saveBankSettings,
  loadBankSettings,
} from "@/lib/chouhyo/storage";
import {
  listRecords,
  getRecord,
  upsertRecord,
  removeRecord,
  newRecordId,
  seedSampleIfNeeded,
  type GenbaEstimateRecord,
} from "@/lib/genba/storage";
import BasicFields from "@/components/chouhyo/BasicFields";
import IssuerFields from "@/components/chouhyo/IssuerFields";
import ClientFields from "@/components/chouhyo/ClientFields";
import ItemsTable from "@/components/chouhyo/ItemsTable";
import BankFields from "@/components/chouhyo/BankFields";
import TermsFields from "@/components/chouhyo/TermsFields";
import PreviewPanel from "@/components/chouhyo/PreviewPanel";
import ProductPicker from "./ProductPicker";
import type { Product } from "@/lib/genba/catalog";
import EstimatePreview from "@/components/chouhyo/EstimatePreview";
import { textareaCls, labelCls, inputCls } from "@/components/chouhyo/fieldStyles";

const DEFAULT_MEMO = `有効期限：発行日より1ヶ月

・本見積の内容は諸条件により変更となる場合がございます。
・ご不明な点がございましたらお気軽にお問い合わせください。`;

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
    terms: { enabled: false, text: DEFAULT_TERMS_TEXT },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function formatYen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

// ================= 一覧ビュー =================
function RecordList({
  records,
  onNew,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  records: GenbaEstimateRecord[];
  onNew: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return records;
    return records.filter(
      (r) =>
        (r.data.client?.name || "").includes(q) ||
        (r.data.subject || "").includes(q)
    );
  }, [records, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="顧客名・件名で検索…"
          className={`${inputCls} sm:max-w-xs`}
          aria-label="保存した見積を検索"
        />
        <button
          type="button"
          onClick={onNew}
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          ＋ 新しい見積をつくる
        </button>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
          <p className="text-4xl">🧰</p>
          <p className="mt-3 text-sm font-bold text-ink">まだ見積がありません</p>
          <p className="mt-1 text-xs text-ink-soft">
            「新しい見積をつくる」から、現場でサッと1枚どうぞ。
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-sm text-ink-soft">
          「{query}」に合う見積は見つかりませんでした
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => {
            const { grandTotal } = calculateTotals(r.data.items);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-line bg-card p-4 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => onOpen(r.id)}
                  className="block w-full text-left"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink">
                      {r.id.startsWith("sample_") && (
                        <span className="rounded-md bg-sun/30 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">
                          サンプル
                        </span>
                      )}
                      {r.data.client?.name
                        ? `${r.data.client.name} ${r.data.client.honorific || ""}`
                        : "（宛名なし）"}
                    </span>
                    <span className="font-mono text-sm font-bold text-teal">
                      {formatYen(grandTotal)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-soft">
                    {r.data.subject || "（件名なし）"}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-mute">
                    {r.data.docNo}｜更新 {formatDate(r.updatedAt)}
                  </p>
                </button>
                <div className="mt-3 flex gap-3 border-t border-line pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="font-bold text-teal underline-offset-2 hover:underline"
                  >
                    開く
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(r.id)}
                    className="text-ink-soft underline-offset-2 hover:underline"
                  >
                    複製して新規
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="ml-auto text-ink-mute underline-offset-2 hover:text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-[11px] text-ink-mute">
        保存した見積はお使いの端末の中だけに残ります（外部には送信されません）
      </p>
    </div>
  );
}

// ================= 本体 =================
export default function GenbaTool() {
  const [records, setRecords] = useState<GenbaEstimateRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, setState] = useState<FormData>(getDefaultState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // マウント時: 初回サンプル投入 → 一覧読み込み
  useEffect(() => {
    seedSampleIfNeeded();
    setRecords(listRecords());
    setIsInitialized(true);
  }, []);

  // 編集中は変更のたびに台帳へ自動保存
  useEffect(() => {
    if (!isInitialized || !editingId) return;
    upsertRecord(editingId, state);
    if (state.issuer?.name) saveIssuerSettings(state.issuer);
    if (state.bank?.name || state.bank?.number || state.bank?.holder) {
      saveBankSettings(state.bank);
    }
  }, [state, editingId, isInitialized]);

  // ---- 一覧側の操作 ----
  const handleNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    const base = getDefaultState();
    const next: FormData = {
      ...base,
      docNo: allocateDocNo("estimate", today),
      issuer: loadIssuerSettings() || base.issuer,
      bank: loadBankSettings() || base.bank,
    };
    const id = newRecordId();
    upsertRecord(id, next);
    setState(next);
    setEditingId(id);
    setShowPicker(true); // まずマスタを見せる(このツールの心臓部)
  };

  const handleOpen = (id: string) => {
    const record = getRecord(id);
    if (!record) return;
    setState({ ...record.data, docType: "estimate" });
    setEditingId(id);
  };

  const handleDuplicate = (id: string) => {
    const record = getRecord(id);
    if (!record) return;
    const today = new Date().toISOString().slice(0, 10);
    const copy: FormData = {
      ...record.data,
      docNo: allocateDocNo("estimate", today),
      issueDate: today,
    };
    const newId = newRecordId();
    upsertRecord(newId, copy);
    setState(copy);
    setEditingId(newId);
  };

  const handleDelete = (id: string) => {
    if (!confirm("この見積を削除しますか？（元に戻せません）")) return;
    removeRecord(id);
    setRecords(listRecords());
  };

  const handleBackToList = () => {
    setEditingId(null);
    setRecords(listRecords());
  };

  // ---- 編集側のハンドラ（estimateツールと同型） ----
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

  // マスタから明細へ追加（最初の空行は置き換える）
  const isEmptyItem = (it: Item) => !it.name && !it.desc && (it.unitPrice ?? 0) === 0;
  const onAddFromCatalog = (product: Product) =>
    setState((s) => {
      const newItem: Item = {
        name: product.name,
        desc: product.description || "",
        qty: 1,
        unit: product.unit,
        unitPrice: product.unitPrice,
        taxRate: 10,
      };
      if (s.items.length === 1 && isEmptyItem(s.items[0])) {
        return { ...s, items: [newItem] };
      }
      return { ...s, items: [...s.items, newItem] };
    });

  // 値引き行（マイナス金額の明細として追加＝見積書の「出精値引き ▲」方式）
  // 「10%」のように%付きで入力すると、現在の小計から金額を自動計算する
  const onAddDiscount = () => {
    const input = prompt(
      "値引きを入力してください\n・金額なら「30000」\n・割引率なら「10%」（今の小計から自動計算）",
      "10%"
    );
    if (input === null) return;
    const trimmed = input.trim();
    let amount = 0;
    let name = "出精値引き";
    if (trimmed.includes("%") || trimmed.includes("％")) {
      const rate = parseFloat(trimmed.replace(/[%％\s]/g, ""));
      if (!rate || rate <= 0 || rate >= 100) return;
      const subtotal = state.items.reduce(
        (sum, it) => sum + (it.unitPrice > 0 ? it.qty * it.unitPrice : 0),
        0
      );
      amount = Math.round((subtotal * rate) / 100);
      name = `出精値引き（${rate}%）`;
      if (!amount) {
        alert("先に工事項目を追加してから、％値引きを入れてください");
        return;
      }
    } else {
      amount = Math.abs(parseInt(trimmed.replace(/[^0-9]/g, ""), 10) || 0);
      if (!amount) return;
    }
    setState((s) => ({
      ...s,
      items: [...s.items, { name, desc: "", qty: 1, unit: "式", unitPrice: -amount, taxRate: 10 }],
    }));
  };

  const { subTotal, taxTotal, grandTotal } = useMemo(
    () => calculateTotals(state.items),
    [state.items]
  );
  const breakdown = useMemo(() => calculateTaxBreakdown(state.items), [state.items]);

  // ================= 一覧ビュー =================
  if (!editingId) {
    return (
      <RecordList
        records={records}
        onNew={handleNew}
        onOpen={handleOpen}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    );
  }

  // ================= 編集ビュー =================
  return (
    <div className="relative left-1/2 grid w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-1 gap-6 lg:grid-cols-2 print:static print:left-0 print:w-auto print:translate-x-0">
      {/* フォーム側(印刷時は非表示) */}
      <section className="no-print">
        <div className="rounded-2xl border border-line bg-card shadow-xs">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
            <h2 className="text-sm font-bold text-ink">見積の内容（自動保存）</h2>
            <button
              type="button"
              onClick={handleBackToList}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-teal transition-colors hover:bg-paper-2"
            >
              ← 一覧へ戻る
            </button>
          </div>

          <div className="space-y-6 p-4">
            {/* マスタ選択・値引き */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                📦 マスタから項目を追加
              </button>
              <button
                type="button"
                onClick={onAddDiscount}
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:border-teal/50"
              >
                ▲ 値引き行を追加
              </button>
            </div>

            <ItemsTable
              docType="estimate"
              items={state.items}
              onItemChange={onChangeItem}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />

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

            <ClientFields docType="estimate" client={state.client} onChange={onChangeClient} />

            <IssuerFields docType="estimate" issuer={state.issuer} onChange={onChangeIssuer} />

            <BankFields docType="estimate" bank={state.bank} onChange={onChangeBank} />



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

      {showPicker && (
        <ProductPicker onAdd={onAddFromCatalog} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
