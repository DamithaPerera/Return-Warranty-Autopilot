import { EmailClassification, EmailProvider, ExtractionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getGoogleClientId,
  getGoogleClientSecret,
  getGmailRedirectUri,
  getGmailScopes,
  isGmailDemoMode
} from "@/lib/gmail/config";
import { demoEmails } from "@/lib/gmail/demo";
import { htmlToPlainText } from "@/lib/gmail/html";

const DEMO_USER_EMAIL = "demo@autopilot.app";

type GmailTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

type GmailMessageListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
};

type GmailMessageFullResponse = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    body?: { data?: string };
    mimeType?: string;
    parts?: Array<{
      mimeType?: string;
      body?: { data?: string };
      parts?: Array<{
        mimeType?: string;
        body?: { data?: string };
      }>;
    }>;
  };
};

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function readHeader(message: GmailMessageFullResponse, headerName: string) {
  return (
    message.payload?.headers?.find((header) => header.name.toLowerCase() === headerName.toLowerCase())?.value ?? ""
  );
}

function extractBodies(message: GmailMessageFullResponse): { htmlBody: string; rawText: string } {
  let htmlBody = "";
  let rawText = "";

  const walk = (part?: GmailMessageFullResponse["payload"]) => {
    if (!part) return;

    if (part.mimeType === "text/plain" && part.body?.data) {
      rawText = rawText || decodeBase64Url(part.body.data);
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      htmlBody = htmlBody || decodeBase64Url(part.body.data);
    }

    part.parts?.forEach((child) => {
      if (child.mimeType === "text/plain" && child.body?.data) {
        rawText = rawText || decodeBase64Url(child.body.data);
      }
      if (child.mimeType === "text/html" && child.body?.data) {
        htmlBody = htmlBody || decodeBase64Url(child.body.data);
      }
      child.parts?.forEach((nested) => {
        if (nested.mimeType === "text/plain" && nested.body?.data) {
          rawText = rawText || decodeBase64Url(nested.body.data);
        }
        if (nested.mimeType === "text/html" && nested.body?.data) {
          htmlBody = htmlBody || decodeBase64Url(nested.body.data);
        }
      });
    });
  };

  walk(message.payload);

  const normalized = rawText || (htmlBody ? htmlToPlainText(htmlBody) : "");
  return { htmlBody, rawText: normalized };
}

function classifyEmail(subject: string, snippet: string, fromEmail: string) {
  const haystack = `${subject} ${snippet} ${fromEmail}`.toLowerCase();
  if (haystack.includes("receipt") || haystack.includes("order") || haystack.includes("invoice")) {
    return EmailClassification.RECEIPT;
  }
  if (haystack.includes("warranty")) {
    return EmailClassification.WARRANTY;
  }
  if (haystack.includes("shipped") || haystack.includes("delivery") || haystack.includes("tracking")) {
    return EmailClassification.SHIPPING;
  }
  return EmailClassification.OTHER;
}

async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User"
    }
  });
}

export function getGmailAuthStartUrl() {
  if (isGmailDemoMode()) return null;

  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGmailRedirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: getGmailScopes().join(" "),
    state: "return-warranty-autopilot"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForToken(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGmailRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token exchange failed: ${body}`);
  }

  return (await response.json()) as GmailTokenResponse;
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Refresh token failed: ${body}`);
  }

  return (await response.json()) as GmailTokenResponse;
}

async function fetchGmailProfile(accessToken: string) {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch profile: ${body}`);
  }

  return (await response.json()) as { emailAddress: string };
}

export async function handleGmailOAuthCallback(code: string) {
  const user = await ensureDemoUser();

  if (isGmailDemoMode()) {
    await prisma.emailAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: EmailProvider.GMAIL,
          providerAccountId: "demo-gmail-account"
        }
      },
      update: {
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
        scopes: getGmailScopes().join(" ")
      },
      create: {
        userId: user.id,
        provider: EmailProvider.GMAIL,
        providerAccountId: "demo-gmail-account",
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
        scopes: getGmailScopes().join(" ")
      }
    });
    return { mode: "demo" as const };
  }

  const tokens = await exchangeCodeForToken(code);
  const profile = await fetchGmailProfile(tokens.access_token);
  const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

  await prisma.emailAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: EmailProvider.GMAIL,
        providerAccountId: profile.emailAddress
      }
    },
    update: {
      userId: user.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scopes: tokens.scope,
      tokenExpiry
    },
    create: {
      userId: user.id,
      provider: EmailProvider.GMAIL,
      providerAccountId: profile.emailAddress,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scopes: tokens.scope,
      tokenExpiry
    }
  });

  return { mode: "oauth" as const };
}

async function resolveAccessToken(account: {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: Date | null;
}) {
  if (!account.tokenExpiry || account.tokenExpiry.getTime() > Date.now() + 60_000) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    return account.accessToken;
  }

  const refreshed = await refreshAccessToken(account.refreshToken);
  const nextExpiry = new Date(Date.now() + refreshed.expires_in * 1000);

  await prisma.emailAccount.update({
    where: { id: account.id },
    data: {
      accessToken: refreshed.access_token,
      tokenExpiry: nextExpiry,
      scopes: refreshed.scope ?? undefined
    }
  });

  return refreshed.access_token;
}

async function fetchRecentGmailEmails(accessToken: string, maxResults = 100) {
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!listResponse.ok) {
    const body = await listResponse.text();
    throw new Error(`Failed to list messages: ${body}`);
  }

  const list = (await listResponse.json()) as GmailMessageListResponse;
  const ids = list.messages ?? [];

  const detailResponses = await Promise.all(
    ids.map(async (entry) => {
      const detail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${entry.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!detail.ok) return null;
      return (await detail.json()) as GmailMessageFullResponse;
    })
  );

  return detailResponses.filter((entry): entry is GmailMessageFullResponse => Boolean(entry));
}

function toEmailCreateInput(
  userId: string,
  data: {
    gmailMessageId: string;
    threadId: string;
    subject: string;
    fromEmail: string;
    snippet: string;
    receivedAt: Date;
    rawText: string;
    htmlBody: string;
  }
): Prisma.EmailMessageUncheckedCreateInput {
  return {
    userId,
    gmailMessageId: data.gmailMessageId,
    threadId: data.threadId,
    subject: data.subject,
    fromEmail: data.fromEmail,
    snippet: data.snippet,
    receivedAt: data.receivedAt,
    rawText: data.rawText,
    htmlBody: data.htmlBody,
    classification: classifyEmail(data.subject, data.snippet, data.fromEmail),
    extractionStatus: ExtractionStatus.PROCESSED
  };
}

export async function syncGmailEmails(limit = 100) {
  const user = await ensureDemoUser();

  if (isGmailDemoMode()) {
    await prisma.emailAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: EmailProvider.GMAIL,
          providerAccountId: "demo-gmail-account"
        }
      },
      update: {
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
        scopes: getGmailScopes().join(" ")
      },
      create: {
        userId: user.id,
        provider: EmailProvider.GMAIL,
        providerAccountId: "demo-gmail-account",
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
        scopes: getGmailScopes().join(" ")
      }
    });

    let storedCount = 0;
    for (const message of demoEmails.slice(0, Math.min(limit, 100))) {
      const rawText = htmlToPlainText(message.htmlBody);
      await prisma.emailMessage.upsert({
        where: { gmailMessageId: message.gmailMessageId },
        update: toEmailCreateInput(user.id, {
          gmailMessageId: message.gmailMessageId,
          threadId: message.threadId,
          subject: message.subject,
          fromEmail: message.fromEmail,
          snippet: message.snippet,
          receivedAt: new Date(message.receivedAt),
          rawText,
          htmlBody: message.htmlBody
        }),
        create: toEmailCreateInput(user.id, {
          gmailMessageId: message.gmailMessageId,
          threadId: message.threadId,
          subject: message.subject,
          fromEmail: message.fromEmail,
          snippet: message.snippet,
          receivedAt: new Date(message.receivedAt),
          rawText,
          htmlBody: message.htmlBody
        })
      });
      storedCount += 1;
    }

    return { mode: "demo" as const, fetchedCount: storedCount, storedCount };
  }

  const account = await prisma.emailAccount.findFirst({
    where: { userId: user.id, provider: EmailProvider.GMAIL },
    orderBy: { createdAt: "desc" }
  });

  if (!account) {
    throw new Error("Gmail account not connected.");
  }

  const accessToken = await resolveAccessToken(account);
  const messages = await fetchRecentGmailEmails(accessToken, Math.min(limit, 100));

  let storedCount = 0;
  for (const message of messages) {
    const subject = readHeader(message, "Subject") || "(No Subject)";
    const fromEmail = readHeader(message, "From") || "";
    const { htmlBody, rawText } = extractBodies(message);
    const snippet = message.snippet ?? "";
    const receivedAt = message.internalDate ? new Date(Number(message.internalDate)) : new Date();

    await prisma.emailMessage.upsert({
      where: { gmailMessageId: message.id },
      update: toEmailCreateInput(user.id, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        subject,
        fromEmail,
        snippet,
        receivedAt,
        rawText,
        htmlBody
      }),
      create: toEmailCreateInput(user.id, {
        gmailMessageId: message.id,
        threadId: message.threadId,
        subject,
        fromEmail,
        snippet,
        receivedAt,
        rawText,
        htmlBody
      })
    });
    storedCount += 1;
  }

  return { mode: "oauth" as const, fetchedCount: messages.length, storedCount };
}

export async function getGmailStatus() {
  const user = await ensureDemoUser();
  const account = await prisma.emailAccount.findFirst({
    where: { userId: user.id, provider: EmailProvider.GMAIL },
    orderBy: { createdAt: "desc" }
  });
  const messageCount = await prisma.emailMessage.count({ where: { userId: user.id } });

  return {
    connected: Boolean(account),
    demoMode: isGmailDemoMode(),
    provider: account?.provider ?? EmailProvider.GMAIL,
    providerAccountId: account?.providerAccountId ?? null,
    tokenExpiry: account?.tokenExpiry ?? null,
    syncedEmailCount: messageCount
  };
}
