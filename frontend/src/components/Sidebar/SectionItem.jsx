import { Link } from "react-router-dom";

export default function SectionItem({ section, subjectId, currentVideoId }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
      <ul className="mt-2 space-y-1">
        {section.videos.map((video) => {
          const active = Number(currentVideoId) === Number(video.id);
          const locked = video.locked;
          return (
            <li key={video.id}>
              {locked ? (
                <div className="rounded-md bg-slate-50 px-2 py-2 text-xs text-slate-400">
                  {video.title} (Locked)
                </div>
              ) : (
                <Link
                  to={`/subjects/${subjectId}/video/${video.id}`}
                  className={`block rounded-md px-2 py-2 text-xs ${
                    active
                      ? "bg-[#0a4dcf] text-white"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {video.title} {video.is_completed ? "• done" : ""}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
