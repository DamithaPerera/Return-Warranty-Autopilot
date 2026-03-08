import { NextResponse } from "next/server";
import { syncGmailEmails } from "@/lib/gmail/service";

export async function POST() {
  try {
    const result = await syncGmailEmails(100);
    return NextResponse.json(result);
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
