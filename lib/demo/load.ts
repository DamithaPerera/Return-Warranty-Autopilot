import { EmailProvider, ExtractionStatus, PrismaClient } from "@prisma/client";
import { computeDeadlines } from "@/lib/deadlines/engine";
import {
  DEMO_USER_EMAIL,
  demoClaimTemplates,
  demoEmailDataset,
  demoPurchaseDataset
} from "@/lib/demo/data";
import { prisma } from "@/lib/db/prisma";

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getClient(client?: PrismaClient) {
  return client ?? prisma;
}

export async function loadDemoData(client?: PrismaClient) {
  const db = getClient(client);
  const now = new Date();

  const user = await db.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: "Demo User" },
    create: { email: DEMO_USER_EMAIL, name: "Demo User" }
  });

  await db.generatedClaim.deleteMany({ where: { userId: user.id } });
  await db.purchase.deleteMany({ where: { userId: user.id } });
  await db.emailMessage.deleteMany({ where: { userId: user.id } });
  await db.emailAccount.deleteMany({ where: { userId: user.id } });

  await db.emailAccount.create({
    data: {
      userId: user.id,
      provider: EmailProvider.GMAIL,
      providerAccountId: "demo-gmail-account",
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      scopes: "https://www.googleapis.com/auth/gmail.readonly"
    }
  });

  const emailMap = new Map<string, string>();
  for (const message of demoEmailDataset) {
    const created = await db.emailMessage.create({
      data: {
        userId: user.id,
        gmailMessageId: message.gmailMessageId,
        threadId: message.threadId,
        subject: message.subject,
        fromEmail: message.fromEmail,
        snippet: message.snippet,
        receivedAt: addDays(now, message.receivedOffsetDays),
        rawText: message.rawText,
        htmlBody: message.htmlBody,
        classification: message.classification,
        extractionStatus: ExtractionStatus.PROCESSED
      }
    });
    emailMap.set(message.gmailMessageId, created.id);
  }

  const purchases: { orderNumber: string; id: string }[] = [];
  for (const purchase of demoPurchaseDataset) {
    const orderDate = addDays(now, purchase.orderOffsetDays);
    const deliveryDate = addDays(now, purchase.deliveryOffsetDays);

    const created = await db.purchase.create({
      data: {
        userId: user.id,
        emailMessageId: emailMap.get(purchase.emailMessageId) ?? null,
        merchantName: purchase.merchantName,
        orderNumber: purchase.orderNumber,
        orderDate,
        deliveryDate,
        currency: purchase.currency,
        totalAmount: purchase.totalAmount,
        purchaseSource: purchase.source,
        extractedConfidence: purchase.extractedConfidence,
        status: purchase.status
      }
    });

    for (const item of purchase.items) {
      const deadlines = computeDeadlines({
        orderDate,
        deliveryDate,
        returnWindowDays: item.returnWindowDays,
        warrantyMonths: item.warrantyMonths
      });

      await db.purchaseItem.create({
        data: {
          purchaseId: created.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          warrantyMonths: item.warrantyMonths,
          returnWindowDays: item.returnWindowDays,
          returnDeadline: deadlines.returnDeadline,
          warrantyDeadline: deadlines.warrantyDeadline
        }
      });
    }

    purchases.push({ orderNumber: purchase.orderNumber, id: created.id });
  }

  for (const claim of demoClaimTemplates) {
    const purchase = purchases.find((item) => claim.subject.includes(item.orderNumber));
    if (!purchase) continue;
    await db.generatedClaim.create({
      data: {
        userId: user.id,
        purchaseId: purchase.id,
        claimType: claim.claimType,
        subject: claim.subject,
        body: claim.body,
        status: claim.status
      }
    });
  }

  return {
    userId: user.id,
    purchases: purchases.length,
    emails: demoEmailDataset.length,
    claims: demoClaimTemplates.length
  };
}

export async function ensureDemoDataLoaded() {
  const purchaseCount = await prisma.purchase.count();
  if (purchaseCount > 0) return;
  await loadDemoData();
}
