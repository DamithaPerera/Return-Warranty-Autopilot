import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 px-8 py-12 text-white shadow-2xl shadow-blue-900/25">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
              AI-Powered Returns Assistant
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Never Miss A Return Window Or Warranty Deadline Again.
            </h1>
            <p className="max-w-xl text-sm text-cyan-50 md:text-base">
              Return & Warranty Autopilot scans receipts, tracks deadlines, and drafts ready-to-send claim emails in
              one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-cyan-50"
              >
                Open Dashboard
              </Link>
              <Link
                href="/connect/gmail"
                className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
              >
                Connect Email
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-sm rounded-3xl bg-white/90 p-6 text-slate-900 shadow-xl">
              <h2 className="text-lg font-bold">Live Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-cyan-50 px-3 py-2">
                  <span>Total Purchases</span>
                  <strong>3</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
                  <span>Returns Closing Soon</span>
                  <strong>2</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
                  <span>Active Warranties</span>
                  <strong>4</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Receipt Intelligence",
            body: "Detects purchase-related emails and extracts structured order data automatically."
          },
          {
            title: "Deadline Engine",
            body: "Calculates return and warranty deadlines with smart fallbacks and status labels."
          },
          {
            title: "Claim Generator",
            body: "Drafts return/refund/warranty emails with AI and reliable fallback templates."
          }
        ].map((feature) => (
          <article key={feature.title} className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-200 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Connect Gmail or load built-in demo data.</li>
            <li>2. Sync and classify only purchase-like emails.</li>
            <li>3. Extract purchase details and populate dashboard.</li>
            <li>4. Generate claim emails and take action quickly.</li>
          </ol>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6">
          <p className="max-w-sm text-center text-base font-semibold text-slate-700">
            Built for hackathon demos and local-first workflows. Works even without Gmail credentials and OpenAI key.
          </p>
        </div>
      </div>
    </section>
  );
}
