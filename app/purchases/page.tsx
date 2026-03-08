import { PurchasesTable } from "@/components/purchases-table";
import { getPurchases } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Purchases</h1>
        <p className="mt-1 text-sm text-slate-600">All tracked orders from receipt extraction.</p>
      </div>
      <PurchasesTable purchases={purchases} />
    </section>
  );
}
