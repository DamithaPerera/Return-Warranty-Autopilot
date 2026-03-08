export type StatusTone = "good" | "warn" | "danger" | "muted";

export type DeadlineStatus = {
  label: string;
  tone: StatusTone;
  statusLabel?: string;
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function daysUntil(deadline: Date, now = new Date()): number {
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / DAY_MS);
}

export function getReturnStatus(deadline: Date | null, now = new Date()): DeadlineStatus {
  if (!deadline) return { label: "No return policy", tone: "muted", statusLabel: "other" };
  const remaining = daysUntil(deadline, now);
  if (remaining < 0) return { label: "Return expired", tone: "danger", statusLabel: "return_expired" };
  if (remaining <= 7) {
    return {
      label: `Return closes in ${remaining} day${remaining === 1 ? "" : "s"}`,
      tone: "warn",
      statusLabel: "return_closing_soon"
    };
  }
  return { label: `${remaining} days left to return`, tone: "good", statusLabel: "return_active" };
}

export function getWarrantyStatus(deadline: Date | null, now = new Date()): DeadlineStatus {
  if (!deadline) return { label: "No warranty", tone: "muted", statusLabel: "other" };
  const remaining = daysUntil(deadline, now);
  if (remaining < 0) return { label: "Warranty expired", tone: "danger", statusLabel: "warranty_expired" };
  return { label: `${remaining} days warranty left`, tone: "good", statusLabel: "warranty_active" };
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

export function formatDate(value: Date | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(value);
}
