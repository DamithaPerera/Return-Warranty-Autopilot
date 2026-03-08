"use client";

import { useState } from "react";

export function GmailActions() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handleSync() {
    setSyncing(true);
    setResult("");
    try {
      const response = await fetch("/api/gmail/sync", { method: "POST" });
      const data = (await response.json()) as {
        storedCount?: number;
        mode?: string;
        error?: string;
        extraction?: {
          classifiedCount: number;
          extractedCount: number;
          savedPurchaseCount: number;
          mockExtractions: number;
        } | null;
      };
      if (!response.ok) {
        setResult(data.error ?? "Sync failed");
        return;
      }
      const extractionSummary = data.extraction
        ? ` Classified ${data.extraction.classifiedCount}, extracted ${data.extraction.extractedCount}, saved ${data.extraction.savedPurchaseCount} purchases.`
        : "";
      setResult(`Synced ${data.storedCount ?? 0} emails (${data.mode ?? "unknown"} mode).${extractionSummary}`);
    } catch {
      setResult("Sync failed due to network or server error.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="/api/gmail/auth/start"
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
      >
        Connect Gmail
      </a>
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {syncing ? "Syncing..." : "Sync Emails"}
      </button>
      {result ? <p className="text-sm text-slate-600">{result}</p> : null}
    </div>
  );
}
