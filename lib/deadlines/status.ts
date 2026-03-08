export type StatusTone = "good" | "warn" | "danger" | "muted";

export type DeadlineStatus = {
  label: string;
  tone: StatusTone;
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function daysUntil(deadline: Date, now = new Date()): number {
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / DAY_MS);
}

export function getReturnStatus(deadline: Date | null, now = new Date()): DeadlineStatus {
  if (!deadline) return { label: "No return policy", tone: "muted" };
  const remaining = daysUntil(deadline, now);
  if (remaining < 0) return { label: "Return expired", tone: "danger" };
  if (remaining <= 7) return { label: `Return closes in ${remaining} day${remaining === 1 ? "" : "s"}`, tone: "warn" };
  return { label: `${remaining} days left to return`, tone: "good" };
}

export function getWarrantyStatus(deadline: Date | null, now = new Date()): DeadlineStatus {
  if (!deadline) return { label: "No warranty", tone: "muted" };
  const remaining = daysUntil(deadline, now);
  if (remaining < 0) return { label: "Warranty expired", tone: "danger" };
  return { label: `${remaining} days warranty left`, tone: "good" };
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
