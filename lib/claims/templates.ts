export type ClaimTypeInput = "return_request" | "refund_request" | "warranty_claim";

type BuildTemplateInput = {
  claimType: ClaimTypeInput;
  tone: string;
  merchantName: string;
  orderNumber: string;
  supportEmail: string | null;
  itemSummary: string;
};

function toneLine(tone: string) {
  if (tone.toLowerCase().includes("firm")) return "I appreciate your prompt action on this request.";
  if (tone.toLowerCase().includes("friendly")) return "Thanks in advance for your help.";
  return "Please let me know if you need any additional details.";
}

export function buildTemplatedClaim(input: BuildTemplateInput) {
  const support = input.supportEmail ?? "Support Team";
  const toneSentence = toneLine(input.tone);

  if (input.claimType === "warranty_claim") {
    return {
      subject: `Warranty Claim - Order ${input.orderNumber}`,
      body: `Hello ${support},

I am contacting you to submit a warranty claim for order ${input.orderNumber} from ${input.merchantName}.
Affected item(s): ${input.itemSummary}.

The product appears to have an issue that should be covered under warranty. Please advise next steps for repair or replacement.
${toneSentence}

Regards,
Customer`
    };
  }

  if (input.claimType === "refund_request") {
    return {
      subject: `Refund Request - Order ${input.orderNumber}`,
      body: `Hello ${support},

I would like to request a refund for order ${input.orderNumber} from ${input.merchantName}.
Relevant item(s): ${input.itemSummary}.

Please process the refund and confirm once completed.
${toneSentence}

Regards,
Customer`
    };
  }

  return {
    subject: `Return Request - Order ${input.orderNumber}`,
    body: `Hello ${support},

I would like to initiate a return for order ${input.orderNumber} from ${input.merchantName}.
Item(s): ${input.itemSummary}.

Please share return instructions and any required labels.
${toneSentence}

Regards,
Customer`
  };
}
