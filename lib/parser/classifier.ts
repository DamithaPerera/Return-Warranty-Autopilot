export type PurchaseEmailClass =
  | "purchase_confirmation"
  | "shipping_update"
  | "invoice"
  | "subscription"
  | "promotion"
  | "other";

const SUBJECT_KEYWORDS = ["order", "receipt", "invoice", "purchase", "shipped", "delivered"];
const SENDER_PATTERNS = ["orders@", "receipts@", "support@"];
const PROMOTION_KEYWORDS = ["newsletter", "promo", "sale", "discount", "deal", "unsubscribe", "marketing"];
const SUBSCRIPTION_KEYWORDS = [
  "subscription",
  "renewal",
  "membership",
  "monthly plan",
  "yearly plan",
  "next billing",
  "billing cycle"
];

export function classifyPurchaseEmail(subject: string, fromEmail: string, snippet = ""): PurchaseEmailClass {
  const loweredSubject = subject.toLowerCase();
  const loweredFrom = fromEmail.toLowerCase();
  const loweredSnippet = snippet.toLowerCase();
  const combined = `${loweredSubject} ${loweredSnippet} ${loweredFrom}`;

  if (PROMOTION_KEYWORDS.some((keyword) => combined.includes(keyword))) return "promotion";
  if (SUBSCRIPTION_KEYWORDS.some((keyword) => combined.includes(keyword))) return "subscription";

  const hasSubjectKeyword = SUBJECT_KEYWORDS.some((keyword) => `${loweredSubject} ${loweredSnippet}`.includes(keyword));
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

export function shouldExtractPurchaseEmail(category: PurchaseEmailClass) {
  return category === "purchase_confirmation" || category === "shipping_update" || category === "invoice";
}
