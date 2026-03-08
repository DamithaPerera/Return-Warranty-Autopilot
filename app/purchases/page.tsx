import { PurchasesTable } from "@/components/purchases-table";
import { getPurchases } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const purchases = await getPurchases();
  const tablePurchases = purchases.map((purchase) => ({
    id: purchase.id,
    merchantName: purchase.merchantName,
    orderNumber: purchase.orderNumber,
    orderDate: purchase.orderDate.toISOString(),
    currency: purchase.currency,
    totalAmount: Number(purchase.totalAmount),
    items: purchase.items.map((item) => ({
      id: item.id,
      returnDeadline: item.returnDeadline ? item.returnDeadline.toISOString() : null
    }))
  }));

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white/80 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Purchases</h1>
        <p className="mt-1 text-sm text-slate-600">All tracked orders from receipt extraction.</p>
      </div>
      <PurchasesTable purchases={tablePurchases} />
    </section>
  );
}
