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
  const normalized = tone.toLowerCase();
  if (normalized.includes("angry") || normalized.includes("urgent")) {
    return "This issue has caused significant inconvenience. I expect a prompt resolution.";
  }
  if (normalized.includes("firm")) {
    return "I appreciate your prompt action on this request.";
  }
  if (normalized.includes("friendly")) {
    return "Thanks in advance for your help.";
  }
  if (normalized.includes("polite")) {
    return "I would greatly appreciate your assistance with this request.";
  }
  return "Please let me know if you need any additional details.";
}

function subjectPrefix(claimType: ClaimTypeInput, tone: string) {
  const normalized = tone.toLowerCase();
  if (normalized.includes("angry") || normalized.includes("urgent")) {
    return claimType === "refund_request" ? "Urgent Refund Request" : "Urgent Claim Request";
  }
  if (claimType === "warranty_claim") return "Warranty Claim";
  if (claimType === "refund_request") return "Refund Request";
  return "Return Request";
}

export function buildTemplatedClaim(input: BuildTemplateInput) {
  const support = input.supportEmail ?? "Support Team";
  const toneSentence = toneLine(input.tone);

  if (input.claimType === "warranty_claim") {
    return {
      subject: `${subjectPrefix(input.claimType, input.tone)} - Order ${input.orderNumber}`,
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
      subject: `${subjectPrefix(input.claimType, input.tone)} - Order ${input.orderNumber}`,
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
    subject: `${subjectPrefix(input.claimType, input.tone)} - Order ${input.orderNumber}`,
    body: `Hello ${support},

I would like to initiate a return for order ${input.orderNumber} from ${input.merchantName}.
Item(s): ${input.itemSummary}.

Please share return instructions and any required labels.
${toneSentence}

Regards,
Customer`
  };
}
