import { NextRequest, NextResponse } from "next/server";
import { generateClaim } from "@/lib/claims/generator";
import { ClaimTypeInput } from "@/lib/claims/templates";

type RequestBody = {
  claimType: ClaimTypeInput;
  purchaseId: string;
  tone: string;
};

function isValidClaimType(claimType: string): claimType is ClaimTypeInput {
  return claimType === "return_request" || claimType === "refund_request" || claimType === "warranty_claim";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<RequestBody>;
  if (!body.purchaseId || !body.claimType || !isValidClaimType(body.claimType)) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    const result = await generateClaim({
      purchaseId: body.purchaseId,
      claimType: body.claimType,
      tone: body.tone ?? "professional"
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate claim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
