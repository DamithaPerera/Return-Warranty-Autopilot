import { NextResponse } from "next/server";
import { loadDemoData } from "@/lib/demo/load";

export async function POST() {
  try {
    const result = await loadDemoData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load demo data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
