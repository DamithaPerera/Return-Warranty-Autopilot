import { GmailActions } from "@/app/connect/gmail/actions";
import { SyncedEmailsTable } from "@/components/synced-emails-table";
import { prisma } from "@/lib/db/prisma";
import { getGmailStatus } from "@/lib/gmail/service";

export const dynamic = "force-dynamic";

export default async function ConnectGmailPage() {
  const status = await getGmailStatus();
  const messages = await prisma.emailMessage.findMany({
    orderBy: { receivedAt: "desc" },
    take: 10
  });
  const tableEmails = messages.map((message) => ({
    id: message.id,
    subject: message.subject,
    fromEmail: message.fromEmail,
    classification: message.classification,
    receivedAt: message.receivedAt.toISOString()
  }));

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white/80 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Connect Gmail</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connect an inbox and sync recent emails for receipt/warranty extraction.
        </p>
      </div>

      <article className="glass-card rounded-2xl p-5">
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

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Recent Synced Emails</h2>
        <SyncedEmailsTable emails={tableEmails} />
      </div>
    </section>
  );
}
