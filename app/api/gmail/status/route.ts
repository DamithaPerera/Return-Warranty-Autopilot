import { NextResponse } from "next/server";
import { getGmailStatus } from "@/lib/gmail/service";

export async function GET() {
  const status = await getGmailStatus();
  return NextResponse.json(status);
}
