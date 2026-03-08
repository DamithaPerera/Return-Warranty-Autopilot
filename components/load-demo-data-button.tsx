"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoadDemoDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleLoadDemoData() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/demo/load", { method: "POST" });
      const data = (await response.json()) as { purchases?: number; emails?: number; claims?: number; error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Failed to load demo data.");
        return;
      }
      setMessage(`Loaded ${data.purchases ?? 0} purchases, ${data.emails ?? 0} emails, ${data.claims ?? 0} claims.`);
      router.refresh();
    } catch {
      setMessage("Failed to load demo data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLoadDemoData}
        disabled={loading}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? "Loading..." : "Load Demo Data"}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
