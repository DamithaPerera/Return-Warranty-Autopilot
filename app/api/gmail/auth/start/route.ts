import { NextResponse } from "next/server";
import { getBaseUrl, isGmailDemoMode } from "@/lib/gmail/config";
import { getGmailAuthStartUrl } from "@/lib/gmail/service";

export async function GET() {
  if (isGmailDemoMode()) {
    return NextResponse.redirect(`${getBaseUrl()}/connect/gmail?mode=demo`);
  }

  const url = getGmailAuthStartUrl();
  if (!url) {
    return NextResponse.json({ error: "Unable to start Gmail OAuth." }, { status: 500 });
  }

  return NextResponse.redirect(url);
}
