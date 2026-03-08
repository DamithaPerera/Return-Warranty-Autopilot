import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/gmail/config";
import { handleGmailOAuthCallback } from "@/lib/gmail/service";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${getBaseUrl()}/connect/gmail?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${getBaseUrl()}/connect/gmail?error=missing_code`);
  }

  try {
    const result = await handleGmailOAuthCallback(code);
    return NextResponse.redirect(`${getBaseUrl()}/connect/gmail?connected=1&mode=${result.mode}`);
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "callback_failed";
    return NextResponse.redirect(`${getBaseUrl()}/connect/gmail?error=${encodeURIComponent(message)}`);
  }
}
