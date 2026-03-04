export default function VideoProgressBar({ percent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Subject Progress</div>
      <div className="h-2 overflow-hidden rounded bg-slate-100">
        <div
          className="h-full bg-[#0a4dcf]"
          style={{ width: `${Math.max(0, Math.min(100, percent || 0))}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-slate-600">{percent || 0}% complete</div>
    </div>
  );
}
