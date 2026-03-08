import { StatusTone } from "@/lib/deadlines/status";

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

const toneClassMap: Record<StatusTone, string> = {
  good: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
  muted: "bg-slate-200 text-slate-600"
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
