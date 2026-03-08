import {
  EmailProvider,
  ExtractionStatus,
  PrismaClient,
  PurchaseSource,
  PurchaseStatus
} from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  const email = "demo@autopilot.app";

  await prisma.generatedClaim.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.emailMessage.deleteMany();
  await prisma.emailAccount.deleteMany();
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo User"
    }
  });

  const now = new Date();

  await prisma.emailAccount.create({
    data: {
      userId: user.id,
      provider: EmailProvider.GMAIL,
      providerAccountId: "demo-gmail-account",
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      scopes: "https://www.googleapis.com/auth/gmail.readonly"
    }
  });

  await prisma.emailMessage.create({
    data: {
      userId: user.id,
      gmailMessageId: "demo-msg-001",
      threadId: "demo-thread-001",
      subject: "Your Amazon.com order has shipped",
      fromEmail: "auto-confirm@amazon.com",
      snippet: "Your package is on the way.",
      receivedAt: addDays(now, -3),
      rawText: "Your package is on the way. Thanks for shopping with us.",
      htmlBody: "<p>Your package is on the way.</p>",
      classification: "shipping_update",
      extractionStatus: ExtractionStatus.PROCESSED
    }
  });

  const amazonDelivery = addDays(now, -25);
  const appleDelivery = addDays(now, -50);
  const shopifyDelivery = addDays(now, -2);

  await prisma.purchase.create({
    data: {
      userId: user.id,
      merchantName: "Amazon",
      orderNumber: "AMZ-114-9923110-4432109",
      orderDate: addDays(now, -27),
      deliveryDate: amazonDelivery,
      currency: "USD",
      totalAmount: 89.97,
      purchaseSource: PurchaseSource.EMAIL_RECEIPT,
      extractedConfidence: 0.96,
      status: PurchaseStatus.ACTIVE,
      items: {
        create: [
          {
            productName: "Anker USB-C Charger 65W",
            quantity: 1,
            unitPrice: 39.99,
            warrantyMonths: 18,
            returnWindowDays: 30,
            returnDeadline: addDays(amazonDelivery, 30),
            warrantyDeadline: addMonths(amazonDelivery, 18)
          },
          {
            productName: "USB-C Cable 2-Pack",
            quantity: 1,
            unitPrice: 49.98,
            warrantyMonths: 12,
            returnWindowDays: 30,
            returnDeadline: addDays(amazonDelivery, 30),
            warrantyDeadline: addMonths(amazonDelivery, 12)
          }
        ]
      }
    }
  });

  await prisma.purchase.create({
    data: {
      userId: user.id,
      merchantName: "Apple",
      orderNumber: "W892401455",
      orderDate: addDays(now, -53),
      deliveryDate: appleDelivery,
      currency: "USD",
      totalAmount: 1299.0,
      purchaseSource: PurchaseSource.EMAIL_RECEIPT,
      extractedConfidence: 0.98,
      status: PurchaseStatus.RETURN_EXPIRED,
      items: {
        create: [
          {
            productName: "MacBook Air 13-inch",
            quantity: 1,
            unitPrice: 1199.0,
            warrantyMonths: 12,
            returnWindowDays: 14,
            returnDeadline: addDays(appleDelivery, 14),
            warrantyDeadline: addMonths(appleDelivery, 12)
          },
          {
            productName: "USB-C Digital AV Multiport Adapter",
            quantity: 1,
            unitPrice: 100.0,
            warrantyMonths: 12,
            returnWindowDays: 14,
            returnDeadline: addDays(appleDelivery, 14),
            warrantyDeadline: addMonths(appleDelivery, 12)
          }
        ]
      }
    }
  });

  await prisma.purchase.create({
    data: {
      userId: user.id,
      merchantName: "Shopify Store - UrbanThread",
      orderNumber: "UT-98742",
      orderDate: addDays(now, -4),
      deliveryDate: shopifyDelivery,
      currency: "USD",
      totalAmount: 134.5,
      purchaseSource: PurchaseSource.EMAIL_RECEIPT,
      extractedConfidence: 0.91,
      status: PurchaseStatus.ACTIVE,
      items: {
        create: [
          {
            productName: "Premium Denim Jacket",
            quantity: 1,
            unitPrice: 89.5,
            warrantyMonths: 0,
            returnWindowDays: 15,
            returnDeadline: addDays(shopifyDelivery, 15),
            warrantyDeadline: null
          },
          {
            productName: "Cotton Tee (2-Pack)",
            quantity: 1,
            unitPrice: 45.0,
            warrantyMonths: 0,
            returnWindowDays: 15,
            returnDeadline: addDays(shopifyDelivery, 15),
            warrantyDeadline: null
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
