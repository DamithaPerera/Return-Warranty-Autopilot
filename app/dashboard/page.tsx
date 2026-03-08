import { PurchasesTable } from "@/components/purchases-table";
import { StatCard } from "@/components/stat-card";
import { LoadDemoDataButton } from "@/components/load-demo-data-button";
import { getDashboardStats, getPurchases } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, purchases] = await Promise.all([getDashboardStats(), getPurchases()]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track purchase returns and warranties from extracted receipt data.
        </p>
        <div className="mt-4">
          <LoadDemoDataButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Purchases" value={stats.totalPurchases} />
        <StatCard label="Returns Closing Soon" value={stats.returnsClosingSoon} />
        <StatCard label="Active Warranties" value={stats.activeWarranties} />
        <StatCard label="Expired Returns" value={stats.expiredReturns} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent Purchases</h2>
        <PurchasesTable purchases={purchases} />
      </div>
    </section>
  );
}
