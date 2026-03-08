"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, getReturnStatus } from "@/lib/deadlines/status";
import { StatusBadge } from "@/components/status-badge";

type PurchaseTableRow = {
  id: string;
  merchantName: string;
  orderNumber: string;
  orderDate: string;
  currency: string;
  totalAmount: number;
  items: Array<{
    id: string;
    returnDeadline: string | null;
  }>;
};

type PurchasesTableProps = {
  purchases: PurchaseTableRow[];
};

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return purchases;
    return purchases.filter((purchase) => {
      return (
        purchase.merchantName.toLowerCase().includes(lowered) ||
        purchase.orderNumber.toLowerCase().includes(lowered)
      );
    });
  }, [purchases, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 bg-white/70 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by merchant or order..."
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
            <th className="px-4 py-3">Merchant</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Return Status</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {paged.map((purchase) => {
            const firstItem = purchase.items[0];
            const parsedReturnDeadline = firstItem?.returnDeadline ? new Date(firstItem.returnDeadline) : null;
            const returnStatus = getReturnStatus(parsedReturnDeadline);

            return (
              <tr key={purchase.id} className="transition hover:bg-cyan-50/40">
                <td className="px-4 py-3 font-medium text-slate-800">{purchase.merchantName}</td>
                <td className="px-4 py-3 text-slate-600">{purchase.orderNumber}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(new Date(purchase.orderDate))}
                </td>
                <td className="px-4 py-3 text-slate-800">
                  {formatCurrency(Number(purchase.totalAmount), purchase.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={returnStatus.label} tone={returnStatus.tone} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="text-sm font-semibold text-cyan-700 hover:text-cyan-500"
                    href={`/purchases/${purchase.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
          {paged.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                No purchases found for this search.
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
    </div>
  );
}
