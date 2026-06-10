import type { DocumentType } from "./types";
import { getLastDocNo, setLastDocNo } from "./storage";

const DOC_NO_PREFIXES: Record<DocumentType, string> = {
  estimate: "EST",
  purchaseOrder: "PO",
  invoice: "INV",
  receipt: "REC",
};

const DOC_NO_REGEX = /^([A-Z]+)-(\d{6})-(\d{3,})$/;

const formatYearMonth = (dateStr?: string): string => {
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
};

const padSequence = (value: number): string => value.toString().padStart(3, "0");

const parseDocNo = (docNo?: string) => {
  if (!docNo) return null;
  const match = docNo.match(DOC_NO_REGEX);
  if (!match) return null;
  return {
    prefix: match[1],
    yearMonth: match[2],
    sequence: Number(match[3]),
  };
};

const buildDocNo = (prefix: string, yearMonth: string, sequence: number): string => {
  return `${prefix}-${yearMonth}-${padSequence(sequence)}`;
};

/**
 * 現在の帳票タイプに対応する次の書類番号を払い出す（年月付き、連番）
 */
export function allocateDocNo(docType: DocumentType, issueDate?: string): string {
  const prefix = DOC_NO_PREFIXES[docType] || "DOC";
  const yearMonth = formatYearMonth(issueDate);
  const lastDocNo = getLastDocNo(docType);
  let sequence = 1;

  const parsed = parseDocNo(lastDocNo);
  if (parsed && parsed.prefix === prefix) {
    sequence = parsed.yearMonth === yearMonth ? parsed.sequence + 1 : 1;
  }

  const docNo = buildDocNo(prefix, yearMonth, sequence);
  setLastDocNo(docType, docNo);
  return docNo;
}

/**
 * ユーザーが手動で入力した書類番号が正しいフォーマットなら履歴に反映
 */
export function recordDocNoIfValid(docType: DocumentType, docNo: string): void {
  const prefix = DOC_NO_PREFIXES[docType] || "DOC";
  const parsed = parseDocNo(docNo);
  if (!parsed || parsed.prefix !== prefix) return;
  const normalized = buildDocNo(parsed.prefix, parsed.yearMonth, parsed.sequence);
  setLastDocNo(docType, normalized);
}

export const getDocNoSample = (docType: DocumentType): string => {
  const prefix = DOC_NO_PREFIXES[docType] || "DOC";
  return `${prefix}-YYYYMM-001`;
};
