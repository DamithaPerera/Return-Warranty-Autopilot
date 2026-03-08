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
        className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Loading..." : "Load Demo Data"}
      </button>
      {message ? <p className="text-xs font-medium text-slate-600">{message}</p> : null}
    </div>
  );
}
