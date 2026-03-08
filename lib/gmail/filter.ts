import { classifyPurchaseEmail, shouldExtractPurchaseEmail } from "@/lib/parser/classifier";

export function buildPurchaseFocusedQuery() {
  return [
    "(category:purchases OR subject:(order OR receipt OR invoice OR shipped OR delivered))",
    "-category:promotions",
    "-subject:(newsletter OR promo OR sale OR discount OR deal)",
    "-unsubscribe"
  ].join(" ");
}

export function isLikelyPurchaseEmail(subject: string, fromEmail: string, snippet = "") {
  const category = classifyPurchaseEmail(subject, fromEmail, snippet);
  return shouldExtractPurchaseEmail(category);
}
