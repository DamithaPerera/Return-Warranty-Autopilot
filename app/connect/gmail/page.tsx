import { GmailActions } from "@/app/connect/gmail/actions";
import { prisma } from "@/lib/db/prisma";
import { getGmailStatus } from "@/lib/gmail/service";

export const dynamic = "force-dynamic";

export default async function ConnectGmailPage() {
  const status = await getGmailStatus();
  const messages = await prisma.emailMessage.findMany({
    orderBy: { receivedAt: "desc" },
    take: 10
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Connect Gmail</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connect an inbox and sync recent emails for receipt/warranty extraction.
        </p>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-900">Connected:</span> {status.connected ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium text-slate-900">Mode:</span> {status.demoMode ? "Demo" : "OAuth"}
          </p>
          <p>
            <span className="font-medium text-slate-900">Account:</span>{" "}
            {status.providerAccountId ?? "Not connected"}
          </p>
          <p>
            <span className="font-medium text-slate-900">Synced Emails:</span> {status.syncedEmailCount}
          </p>
        </div>
        <div className="mt-5">
          <GmailActions />
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Recent Synced Emails</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {messages.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={4}>
                  No emails synced yet. Use Connect Gmail then Sync Emails.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id}>
                  <td className="px-4 py-3 text-slate-800">{message.subject}</td>
                  <td className="px-4 py-3 text-slate-600">{message.fromEmail ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{message.classification}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric"
                    }).format(message.receivedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}
