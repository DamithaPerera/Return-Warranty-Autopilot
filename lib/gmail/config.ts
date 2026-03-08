const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function getGmailScopes() {
  return GMAIL_SCOPES;
}

export function isGmailDemoMode() {
  return !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getGmailRedirectUri() {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI ?? `${getBaseUrl()}/api/gmail/auth/callback`;
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID ?? "";
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET ?? "";
}
