import { ClaimType, ClaimStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildTemplatedClaim } from "@/lib/claims/templates";
import type { ClaimTypeInput } from "@/lib/claims/templates";

type GenerateClaimInput = {
  claimType: ClaimTypeInput;
  purchaseId: string;
  tone: string;
};

function toPrismaClaimType(claimType: ClaimTypeInput): ClaimType {
  if (claimType === "refund_request") return ClaimType.REFUND_REQUEST;
  if (claimType === "warranty_claim") return ClaimType.WARRANTY_CLAIM;
  return ClaimType.RETURN_REQUEST;
}

async function generateWithOpenAI(args: {
  claimType: ClaimTypeInput;
  tone: string;
  merchantName: string;
  orderNumber: string;
  itemSummary: string;
  supportEmail: string | null;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const prompt = `
Generate a customer service email for this claim.
Return strict JSON:
{"subject": string, "body": string}

Claim Type: ${args.claimType}
Tone: ${args.tone}
Merchant: ${args.merchantName}
Order Number: ${args.orderNumber}
Support Email: ${args.supportEmail ?? "unknown"}
Items: ${args.itemSummary}
`.trim();

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
          name: "claim_email",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["subject", "body"],
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { output_text?: string };
  if (!payload.output_text) return null;

  const parsed = JSON.parse(payload.output_text) as { subject: string; body: string };
  return parsed;
}

export async function generateClaim(input: GenerateClaimInput) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: input.purchaseId },
    include: {
      items: true,
      emailMessage: true
    }
  });

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  const itemSummary = purchase.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ") || "N/A";
  const supportEmail = (purchase.emailMessage?.fromEmail ?? null) as string | null;

  const aiResult = await generateWithOpenAI({
    claimType: input.claimType,
    tone: input.tone,
    merchantName: purchase.merchantName,
    orderNumber: purchase.orderNumber,
    itemSummary,
    supportEmail
  });

  const fallback = buildTemplatedClaim({
    claimType: input.claimType,
    tone: input.tone,
    merchantName: purchase.merchantName,
    orderNumber: purchase.orderNumber,
    supportEmail,
    itemSummary
  });

  const content = aiResult ?? fallback;
  const mode = aiResult ? "openai" : "template";

  const saved = await prisma.generatedClaim.create({
    data: {
      userId: purchase.userId,
      purchaseId: purchase.id,
      claimType: toPrismaClaimType(input.claimType),
      subject: content.subject,
      body: content.body,
      status: ClaimStatus.READY
    }
  });

  return {
    id: saved.id,
    subject: saved.subject,
    body: saved.body,
    mode
  };
}
