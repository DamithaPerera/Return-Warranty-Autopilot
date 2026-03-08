type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <div className="mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
    </article>
  );
}
