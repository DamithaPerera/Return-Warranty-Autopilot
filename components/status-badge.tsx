import { StatusTone } from "@/lib/deadlines/status";

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

const toneClassMap: Record<StatusTone, string> = {
  good: "bg-emerald-100/90 text-emerald-800 ring-1 ring-emerald-200",
  warn: "bg-amber-100/90 text-amber-900 ring-1 ring-amber-200",
  danger: "bg-rose-100/90 text-rose-800 ring-1 ring-rose-200",
  muted: "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
