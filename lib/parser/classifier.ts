export type PurchaseEmailClass =
  | "purchase_confirmation"
  | "shipping_update"
  | "invoice"
  | "other";

const SUBJECT_KEYWORDS = ["order", "receipt", "invoice", "purchase", "shipped", "delivered"];
const SENDER_PATTERNS = ["orders@", "receipts@", "support@"];

export function classifyPurchaseEmail(subject: string, fromEmail: string, snippet = ""): PurchaseEmailClass {
  const loweredSubject = subject.toLowerCase();
  const loweredFrom = fromEmail.toLowerCase();
  const loweredSnippet = snippet.toLowerCase();
  const combined = `${loweredSubject} ${loweredSnippet}`;

  const hasSubjectKeyword = SUBJECT_KEYWORDS.some((keyword) => combined.includes(keyword));
  const hasSenderPattern = SENDER_PATTERNS.some((pattern) => loweredFrom.includes(pattern));

  if (!hasSubjectKeyword && !hasSenderPattern) return "other";

  if (combined.includes("invoice")) return "invoice";
  if (combined.includes("shipped") || combined.includes("delivered")) return "shipping_update";
  if (
    combined.includes("order") ||
    combined.includes("receipt") ||
    combined.includes("purchase") ||
    hasSenderPattern
  ) {
    return "purchase_confirmation";
  }

  return "other";
}
