import { buildPurchaseExtractionPrompt } from "@/lib/ai/prompt";
import { ExtractedPurchase } from "@/lib/ai/types";

type EmailForExtraction = {
  subject: string;
  fromEmail: string;
  snippet: string;
  rawText: string;
  htmlBody: string;
};

function normalizeExtracted(data: Partial<ExtractedPurchase>): ExtractedPurchase {
  return {
    merchant_name: data.merchant_name ?? "Unknown Merchant",
    order_number: data.order_number ?? "UNKNOWN",
    order_date: data.order_date ?? null,
    delivery_date: data.delivery_date ?? null,
    currency: data.currency ?? "USD",
    total_amount: Number(data.total_amount ?? 0),
    support_email: data.support_email ?? null,
    items: (data.items ?? []).map((item) => ({
      product_name: item.product_name ?? "Unknown Item",
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      return_window_days: item.return_window_days ?? null,
      warranty_months: item.warranty_months ?? null
    })),
    confidence: Math.max(0, Math.min(1, Number(data.confidence ?? 0.5)))
  };
}

function mockExtract(input: EmailForExtraction): ExtractedPurchase {
  const text = `${input.subject} ${input.snippet} ${input.rawText}`.toLowerCase();

  if (text.includes("amazon")) {
    return normalizeExtracted({
      merchant_name: "Amazon",
      order_number: "AMZ-114-9923110-4432109",
      order_date: "2026-03-01",
      delivery_date: "2026-03-03",
      currency: "USD",
      total_amount: 89.97,
      support_email: "orders@amazon.com",
      items: [
        {
          product_name: "Anker USB-C Charger 65W",
          quantity: 1,
          unit_price: 39.99,
          return_window_days: 30,
          warranty_months: 18
        },
        {
          product_name: "USB-C Cable 2-Pack",
          quantity: 1,
          unit_price: 49.98,
          return_window_days: 30,
          warranty_months: 12
        }
      ],
      confidence: 0.9
    });
  }

  if (text.includes("apple")) {
    return normalizeExtracted({
      merchant_name: "Apple",
      order_number: "W892401455",
      order_date: "2026-02-20",
      delivery_date: "2026-02-22",
      currency: "USD",
      total_amount: 1299.0,
      support_email: "support@apple.com",
      items: [
        {
          product_name: "MacBook Air 13-inch",
          quantity: 1,
          unit_price: 1199.0,
          return_window_days: 14,
          warranty_months: 12
        },
        {
          product_name: "USB-C Digital AV Multiport Adapter",
          quantity: 1,
          unit_price: 100.0,
          return_window_days: 14,
          warranty_months: 12
        }
      ],
      confidence: 0.9
    });
  }

  if (text.includes("urbanthread") || text.includes("shopify")) {
    return normalizeExtracted({
      merchant_name: "Shopify Store - UrbanThread",
      order_number: "UT-98742",
      order_date: "2026-03-04",
      delivery_date: "2026-03-06",
      currency: "USD",
      total_amount: 134.5,
      support_email: "support@urbanthread.example",
      items: [
        {
          product_name: "Premium Denim Jacket",
          quantity: 1,
          unit_price: 89.5,
          return_window_days: 15,
          warranty_months: null
        },
        {
          product_name: "Cotton Tee (2-Pack)",
          quantity: 1,
          unit_price: 45.0,
          return_window_days: 15,
          warranty_months: null
        }
      ],
      confidence: 0.88
    });
  }

  return normalizeExtracted({
    merchant_name: "Unknown Merchant",
    order_number: `UNPARSED-${Date.now()}`,
    order_date: null,
    delivery_date: null,
    currency: "USD",
    total_amount: 0,
    support_email: null,
    items: [],
    confidence: 0.35
  });
}

function parseJsonFromContent(content: string) {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain JSON object.");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as Partial<ExtractedPurchase>;
}

export async function extractPurchaseData(input: EmailForExtraction): Promise<{
  mode: "mock" | "openai";
  purchase: ExtractedPurchase;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { mode: "mock", purchase: mockExtract(input) };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const prompt = buildPurchaseExtractionPrompt(input);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "purchase_extraction",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "merchant_name",
              "order_number",
              "order_date",
              "delivery_date",
              "currency",
              "total_amount",
              "support_email",
              "items",
              "confidence"
            ],
            properties: {
              merchant_name: { type: "string" },
              order_number: { type: "string" },
              order_date: { type: ["string", "null"] },
              delivery_date: { type: ["string", "null"] },
              currency: { type: "string" },
              total_amount: { type: "number" },
              support_email: { type: ["string", "null"] },
              confidence: { type: "number" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "product_name",
                    "quantity",
                    "unit_price",
                    "return_window_days",
                    "warranty_months"
                  ],
                  properties: {
                    product_name: { type: "string" },
                    quantity: { type: "number" },
                    unit_price: { type: "number" },
                    return_window_days: { type: ["number", "null"] },
                    warranty_months: { type: ["number", "null"] }
                  }
                }
              }
            }
          },
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI extraction failed: ${errorText}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };

  if (!payload.output_text) {
    throw new Error("OpenAI extraction returned no output_text.");
  }

  const parsed = parseJsonFromContent(payload.output_text);
  return { mode: "openai", purchase: normalizeExtracted(parsed) };
}
