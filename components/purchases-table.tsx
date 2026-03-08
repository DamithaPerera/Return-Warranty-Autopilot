import Link from "next/link";
import type { Purchase, PurchaseItem } from "@prisma/client";
import { formatCurrency, formatDate, getReturnStatus } from "@/lib/deadlines/status";
import { StatusBadge } from "@/components/status-badge";

type PurchaseWithItems = Purchase & { items: PurchaseItem[] };

type PurchasesTableProps = {
  purchases: PurchaseWithItems[];
};

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
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
          {purchases.map((purchase) => {
            const firstItem = purchase.items[0];
            const returnStatus = getReturnStatus(firstItem?.returnDeadline ?? null);

            return (
              <tr key={purchase.id} className="transition hover:bg-cyan-50/40">
                <td className="px-4 py-3 font-medium text-slate-800">{purchase.merchantName}</td>
                <td className="px-4 py-3 text-slate-600">{purchase.orderNumber}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(purchase.orderDate)}</td>
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
        </tbody>
      </table>
    </div>
  );
}
