import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { getPurchaseById } from "@/lib/db/queries";
import { formatCurrency, formatDate, getReturnStatus, getWarrantyStatus } from "@/lib/deadlines/status";

type PurchaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) notFound();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{purchase.merchantName}</h1>
          <p className="mt-1 text-sm text-slate-600">Order #{purchase.orderNumber}</p>
        </div>
        <Link href="/purchases" className="text-sm font-medium text-brand-700 hover:text-brand-500">
          Back to purchases
        </Link>
      </div>

      <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Order Date:</span> {formatDate(purchase.orderDate)}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Delivery Date:</span> {formatDate(purchase.deliveryDate)}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Total:</span>{" "}
          {formatCurrency(Number(purchase.totalAmount), purchase.currency)}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Confidence:</span>{" "}
          {(purchase.extractedConfidence * 100).toFixed(0)}%
        </p>
      </article>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Return Status</th>
              <th className="px-4 py-3">Warranty Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {purchase.items.map((item) => {
              const returnStatus = getReturnStatus(item.returnDeadline);
              const warrantyStatus = getWarrantyStatus(item.warrantyDeadline);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(Number(item.unitPrice), purchase.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={returnStatus.label} tone={returnStatus.tone} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={warrantyStatus.label} tone={warrantyStatus.tone} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
