import { NextResponse } from "next/server";
import { syncGmailEmails } from "@/lib/gmail/service";
import { prisma } from "@/lib/db/prisma";
import { runPurchaseExtractionPipeline } from "@/lib/parser/pipeline";

export async function POST() {
  try {
    const syncResult = await syncGmailEmails(100);
    const user = await prisma.user.findUnique({ where: { email: "demo@autopilot.app" } });
    if (!user) {
      return NextResponse.json({ ...syncResult, extraction: null });
    }
    const extraction = await runPurchaseExtractionPipeline(user.id, 100);
    return NextResponse.json({ ...syncResult, extraction });
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
