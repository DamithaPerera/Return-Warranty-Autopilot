import { ClaimType, ClaimStatus, PurchaseSource, PurchaseStatus } from "@prisma/client";

export const DEMO_USER_EMAIL = "demo@autopilot.app";

export const demoEmailDataset = [
  {
    gmailMessageId: "demo-gmail-1001",
    threadId: "demo-thread-5001",
    subject: "Amazon.com order AMZ-114-9923110-4432109 confirmation",
    fromEmail: "orders@amazon.com",
    snippet: "Thank you for your order. Your package will arrive soon.",
    classification: "purchase_confirmation",
    rawText:
      "Order AMZ-114-9923110-4432109. Items: Anker USB-C Charger 65W, USB-C Cable 2-Pack. Total USD 89.97.",
    htmlBody:
      "<p>Order AMZ-114-9923110-4432109 confirmed.</p><p>Total: USD 89.97</p><p>30-day returns.</p>",
    receivedOffsetDays: -6
  },
  {
    gmailMessageId: "demo-gmail-1002",
    threadId: "demo-thread-5002",
    subject: "Your Apple receipt for MacBook Air",
    fromEmail: "receipts@apple.com",
    snippet: "This email confirms your Apple Store purchase.",
    classification: "invoice",
    rawText:
      "Receipt W892401455. MacBook Air 13-inch and USB-C Digital AV Multiport Adapter. Total USD 1299.00.",
    htmlBody: "<p>Thanks for your purchase.</p><p>1-year limited warranty included.</p>",
    receivedOffsetDays: -55
  },
  {
    gmailMessageId: "demo-gmail-1003",
    threadId: "demo-thread-5003",
    subject: "UrbanThread order UT-98742 shipped",
    fromEmail: "support@urbanthread.example",
    snippet: "Your Shopify order is on the way.",
    classification: "shipping_update",
    rawText: "Order UT-98742 shipped. Return within 15 days.",
    htmlBody: "<p>Your order has shipped.</p><p>You can return within 15 days.</p>",
    receivedOffsetDays: -4
  }
];

export const demoPurchaseDataset = [
  {
    merchantName: "Amazon",
    orderNumber: "AMZ-114-9923110-4432109",
    orderOffsetDays: -27,
    deliveryOffsetDays: -25,
    currency: "USD",
    totalAmount: 89.97,
    extractedConfidence: 0.96,
    status: PurchaseStatus.ACTIVE,
    source: PurchaseSource.EMAIL_RECEIPT,
    emailMessageId: "demo-gmail-1001",
    items: [
      {
        productName: "Anker USB-C Charger 65W",
        quantity: 1,
        unitPrice: 39.99,
        warrantyMonths: 18,
        returnWindowDays: 30
      },
      {
        productName: "USB-C Cable 2-Pack",
        quantity: 1,
        unitPrice: 49.98,
        warrantyMonths: 12,
        returnWindowDays: 30
      }
    ]
  },
  {
    merchantName: "Apple",
    orderNumber: "W892401455",
    orderOffsetDays: -53,
    deliveryOffsetDays: -50,
    currency: "USD",
    totalAmount: 1299.0,
    extractedConfidence: 0.98,
    status: PurchaseStatus.RETURN_EXPIRED,
    source: PurchaseSource.EMAIL_RECEIPT,
    emailMessageId: "demo-gmail-1002",
    items: [
      {
        productName: "MacBook Air 13-inch",
        quantity: 1,
        unitPrice: 1199.0,
        warrantyMonths: 12,
        returnWindowDays: 14
      },
      {
        productName: "USB-C Digital AV Multiport Adapter",
        quantity: 1,
        unitPrice: 100.0,
        warrantyMonths: 12,
        returnWindowDays: 14
      }
    ]
  },
  {
    merchantName: "Shopify Store - UrbanThread",
    orderNumber: "UT-98742",
    orderOffsetDays: -4,
    deliveryOffsetDays: -2,
    currency: "USD",
    totalAmount: 134.5,
    extractedConfidence: 0.91,
    status: PurchaseStatus.ACTIVE,
    source: PurchaseSource.EMAIL_RECEIPT,
    emailMessageId: "demo-gmail-1003",
    items: [
      {
        productName: "Premium Denim Jacket",
        quantity: 1,
        unitPrice: 89.5,
        warrantyMonths: null,
        returnWindowDays: 15
      },
      {
        productName: "Cotton Tee (2-Pack)",
        quantity: 1,
        unitPrice: 45.0,
        warrantyMonths: null,
        returnWindowDays: 15
      }
    ]
  }
];

export const demoClaimTemplates = [
  {
    claimType: ClaimType.REFUND_REQUEST,
    subject: "Refund Request - Order W892401455",
    body: "Hello Support Team,\n\nI would like to request a refund for order W892401455.\n\nRegards,\nCustomer",
    status: ClaimStatus.READY
  },
  {
    claimType: ClaimType.RETURN_REQUEST,
    subject: "Return Request - Order UT-98742",
    body: "Hello Support Team,\n\nPlease share return instructions for order UT-98742.\n\nRegards,\nCustomer",
    status: ClaimStatus.READY
  },
  {
    claimType: ClaimType.WARRANTY_CLAIM,
    subject: "Warranty Claim - Order AMZ-114-9923110-4432109",
    body: "Hello Support Team,\n\nI need support for a warranty claim on my charger.\n\nRegards,\nCustomer",
    status: ClaimStatus.DRAFT
  }
];
