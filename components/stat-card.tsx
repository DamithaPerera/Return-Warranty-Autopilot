type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
