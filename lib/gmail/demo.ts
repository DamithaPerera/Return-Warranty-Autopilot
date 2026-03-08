export type DemoEmail = {
  gmailMessageId: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  snippet: string;
  receivedAt: string;
  htmlBody: string;
};

export const demoEmails: DemoEmail[] = [
  {
    gmailMessageId: "demo-gmail-1001",
    threadId: "demo-thread-5001",
    subject: "Amazon.com order AMZ-114-9923110-4432109 confirmation",
    fromEmail: "auto-confirm@amazon.com",
    snippet: "Thank you for your order. Your package will arrive soon.",
    receivedAt: "2026-03-06T10:21:00.000Z",
    htmlBody:
      "<html><body><h1>Order Confirmed</h1><p>Order #AMZ-114-9923110-4432109</p><p>Return eligible for 30 days after delivery.</p></body></html>"
  },
  {
    gmailMessageId: "demo-gmail-1002",
    threadId: "demo-thread-5002",
    subject: "Your Apple receipt for MacBook Air",
    fromEmail: "orders@apple.com",
    snippet: "This email confirms your Apple Store purchase.",
    receivedAt: "2026-03-03T13:04:00.000Z",
    htmlBody:
      "<html><body><p>Thanks for your purchase.</p><p>1-year limited warranty included.</p></body></html>"
  },
  {
    gmailMessageId: "demo-gmail-1003",
    threadId: "demo-thread-5003",
    subject: "UrbanThread order UT-98742 shipped",
    fromEmail: "sales@urbanthread.example",
    snippet: "Your Shopify order is on the way.",
    receivedAt: "2026-03-07T08:45:00.000Z",
    htmlBody:
      "<html><body><p>Your order has shipped.</p><p>You can return within 15 days.</p></body></html>"
  }
];
