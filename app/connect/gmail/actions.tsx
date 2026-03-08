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
        ignoredCount?: number;
        mode?: string;
        error?: string;
        extraction?: {
          classifiedCount: number;
          extractedCount: number;
          savedPurchaseCount: number;
          mockExtractions: number;
          heuristicExtractions: number;
          aiFallbackUsed: boolean;
          fallbackMessage: string | null;
        } | null;
      };
      if (!response.ok) {
        setResult(data.error ?? "Sync failed");
        return;
      }
      const extractionSummary = data.extraction
        ? ` Classified ${data.extraction.classifiedCount}, extracted ${data.extraction.extractedCount}, saved ${data.extraction.savedPurchaseCount} purchases.`
        : "";
      const filteredSummary =
        typeof data.ignoredCount === "number" && data.ignoredCount > 0
          ? ` Ignored ${data.ignoredCount} non-purchase emails.`
          : "";
      const fallbackSummary = data.extraction?.aiFallbackUsed
        ? ` ${data.extraction.fallbackMessage ?? "AI unavailable; fallback extraction used."}`
        : "";
      setResult(
        `Synced ${data.storedCount ?? 0} emails (${data.mode ?? "unknown"} mode).${filteredSummary}${extractionSummary}${fallbackSummary}`
      );
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
        className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 hover:brightness-110"
      >
        Connect Gmail
      </a>
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {syncing ? "Syncing..." : "Sync Emails"}
      </button>
      {result ? <p className="text-sm font-medium text-slate-600">{result}</p> : null}
    </div>
  );
}
