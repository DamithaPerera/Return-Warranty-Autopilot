import { PurchaseSource, PurchaseStatus } from "@prisma/client";
import { extractPurchaseData } from "@/lib/ai/extractor";
import { prisma } from "@/lib/db/prisma";
import { classifyPurchaseEmail, shouldExtractPurchaseEmail } from "@/lib/parser/classifier";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export async function runPurchaseExtractionPipeline(userId: string, limit = 100) {
  const emails = await prisma.emailMessage.findMany({
    where: { userId },
    orderBy: { receivedAt: "desc" },
    take: Math.min(limit, 100)
  });

  let classifiedCount = 0;
  let extractedCount = 0;
  let savedPurchaseCount = 0;
  let mockCount = 0;
  let heuristicCount = 0;
  let aiFallbackUsed = false;

  for (const email of emails) {
    const category = classifyPurchaseEmail(email.subject, email.fromEmail ?? "", email.snippet ?? "");
    classifiedCount += 1;

    await prisma.emailMessage.update({
      where: { id: email.id },
      data: { classification: category }
    });

    if (!shouldExtractPurchaseEmail(category)) continue;

    const extraction = await extractPurchaseData({
      subject: email.subject,
      fromEmail: email.fromEmail ?? "",
      snippet: email.snippet ?? "",
      rawText: email.rawText ?? "",
      htmlBody: email.htmlBody ?? ""
    });

    if (extraction.mode === "mock") {
      mockCount += 1;
      aiFallbackUsed = true;
    }

    if (extraction.mode === "heuristic") {
      heuristicCount += 1;
      aiFallbackUsed = true;
    }

    extractedCount += 1;

    const orderDate = parseDate(extraction.purchase.order_date) ?? email.receivedAt;
    const deliveryDate = parseDate(extraction.purchase.delivery_date);

    const existing = await prisma.purchase.findFirst({
      where: { emailMessageId: email.id }
    });

    const purchase = existing
      ? await prisma.purchase.update({
          where: { id: existing.id },
          data: {
            merchantName: extraction.purchase.merchant_name,
            orderNumber: extraction.purchase.order_number,
            orderDate,
            deliveryDate,
            currency: extraction.purchase.currency || "USD",
            totalAmount: extraction.purchase.total_amount,
            purchaseSource: PurchaseSource.EMAIL_RECEIPT,
            extractedConfidence: extraction.purchase.confidence,
            status: PurchaseStatus.ACTIVE
          }
        })
      : await prisma.purchase.create({
          data: {
            userId,
            emailMessageId: email.id,
            merchantName: extraction.purchase.merchant_name,
            orderNumber: extraction.purchase.order_number,
            orderDate,
            deliveryDate,
            currency: extraction.purchase.currency || "USD",
            totalAmount: extraction.purchase.total_amount,
            purchaseSource: PurchaseSource.EMAIL_RECEIPT,
            extractedConfidence: extraction.purchase.confidence,
            status: PurchaseStatus.ACTIVE
          }
        });

    await prisma.purchaseItem.deleteMany({ where: { purchaseId: purchase.id } });

    const itemBaseDate = deliveryDate ?? orderDate;
    for (const item of extraction.purchase.items) {
      const returnDeadline =
        item.return_window_days !== null ? addDays(itemBaseDate, item.return_window_days) : null;
      const warrantyDeadline =
        item.warranty_months !== null ? addMonths(itemBaseDate, item.warranty_months) : null;

      await prisma.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productName: item.product_name,
          quantity: Math.max(1, Math.round(item.quantity || 1)),
          unitPrice: item.unit_price,
          returnWindowDays: item.return_window_days,
          warrantyMonths: item.warranty_months,
          returnDeadline,
          warrantyDeadline
        }
      });
    }

    savedPurchaseCount += 1;
  }

  return {
    classifiedCount,
    extractedCount,
    savedPurchaseCount,
    mockExtractions: mockCount,
    heuristicExtractions: heuristicCount,
    aiFallbackUsed,
    fallbackMessage: aiFallbackUsed
      ? "AI extraction unavailable for some emails. Demo/manual extraction fallback was used."
      : null
  };
}
