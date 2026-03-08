type PromptInput = {
  subject: string;
  fromEmail: string;
  snippet: string;
  rawText: string;
  htmlBody: string;
};

export function buildPurchaseExtractionPrompt(input: PromptInput) {
  return `
You extract purchase data from emails.
Return ONLY valid JSON with this exact shape:
{
  "merchant_name": string,
  "order_number": string,
  "order_date": string|null,
  "delivery_date": string|null,
  "currency": string,
  "total_amount": number,
  "support_email": string|null,
  "items": [
    {
      "product_name": string,
      "quantity": number,
      "unit_price": number,
      "return_window_days": number|null,
      "warranty_months": number|null
    }
  ],
  "confidence": number
}

Rules:
- confidence must be between 0 and 1.
- dates must use YYYY-MM-DD when available.
- infer values conservatively; if unknown, use null or empty items.
- currency should be ISO code like USD.

EMAIL:
Subject: ${input.subject}
From: ${input.fromEmail}
Snippet: ${input.snippet}
Raw Text:
${input.rawText || "(none)"}

HTML:
${input.htmlBody || "(none)"}
`.trim();
}
