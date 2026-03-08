"use client";

import { useMemo, useState } from "react";

type SyncedEmailRow = {
  id: string;
  subject: string;
  fromEmail: string | null;
  classification: string;
  receivedAt: string;
};

type SyncedEmailsTableProps = {
  emails: SyncedEmailRow[];
};

export function SyncedEmailsTable({ emails }: SyncedEmailsTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return emails;
    return emails.filter((email) => {
      return (
        email.subject.toLowerCase().includes(lowered) ||
        (email.fromEmail ?? "").toLowerCase().includes(lowered) ||
        email.classification.toLowerCase().includes(lowered)
      );
    });
  }, [emails, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <article className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 bg-white/70 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search subject, sender, classification..."
            className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
          />
          <p className="text-xs font-medium text-slate-500">
            Showing {paged.length} of {filtered.length}
          </p>
        </div>
      </div>

      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3">Classification</th>
            <th className="px-4 py-3">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {paged.map((email) => (
            <tr key={email.id} className="transition hover:bg-cyan-50/40">
              <td className="px-4 py-3 text-slate-800">{email.subject}</td>
              <td className="px-4 py-3 text-slate-600">{email.fromEmail ?? "-"}</td>
              <td className="px-4 py-3 text-slate-600">{email.classification}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric"
                }).format(new Date(email.receivedAt))}
              </td>
            </tr>
          ))}
          {paged.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                No synced emails found for this search.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white/70 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">
          Page {currentPage} of {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={currentPage === pageCount}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </article>
  );
}
