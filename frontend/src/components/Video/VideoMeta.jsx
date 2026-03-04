export default function VideoMeta({ title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description || "No description"}</p>
    </div>
  );
}
