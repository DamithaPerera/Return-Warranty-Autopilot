"use client";

import { useMemo, useState } from "react";

type GeneratedClaimView = {
  subject: string;
  body: string;
  mode: string;
};

type ClaimGeneratorProps = {
  purchaseId: string;
  initialClaim: GeneratedClaimView | null;
};

export function ClaimGenerator({ purchaseId, initialClaim }: ClaimGeneratorProps) {
  const [claimType, setClaimType] = useState<"return_request" | "refund_request" | "warranty_claim">(
    "return_request"
  );
  const [tone, setTone] = useState("professional");
  const [subject, setSubject] = useState(initialClaim?.subject ?? "");
  const [body, setBody] = useState(initialClaim?.body ?? "");
  const [mode, setMode] = useState(initialClaim?.mode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasGenerated = useMemo(() => subject.length > 0 || body.length > 0, [subject, body]);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/claims/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimType, purchaseId, tone })
      });
      const data = (await response.json()) as { subject?: string; body?: string; mode?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to generate claim.");
        return;
      }

      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
      setMode(data.mode ?? "");
    } catch {
      setError("Failed to generate claim.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const combined = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(combined);
  }

  return (
    <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-600">
          Claim Type
          <select
            value={claimType}
            onChange={(event) =>
              setClaimType(event.target.value as "return_request" | "refund_request" | "warranty_claim")
            }
            className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
          >
            <option value="return_request">return_request</option>
            <option value="refund_request">refund_request</option>
            <option value="warranty_claim">warranty_claim</option>
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Tone
          <input
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Claim"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {mode ? <p className="text-xs text-slate-500">Generated via: {mode}</p> : null}

      {hasGenerated ? (
        <div className="space-y-3">
          <label className="block text-sm text-slate-600">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Email Body
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Copy to clipboard
          </button>
        </div>
      ) : null}
    </article>
  );
}
