import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import apiClient from "../lib/apiClient";
import Alert from "../components/common/Alert";

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClient
      .get("/enrollments/mine")
      .then((res) => {
        if (!active) return;
        setItems(res.data.items || []);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load enrolled courses");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        {error ? <Alert>{error}</Alert> : null}
        {loading ? <p className="text-sm text-slate-600">Loading your courses...</p> : null}
        {!loading && !items.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            You have not enrolled in any course yet.
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((subject) => (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <SubjectCover previewUrl={subject.preview_youtube_url} />
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-blue-700">
                  {subject.title}
                </h3>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {subject.description || "Continue your structured learning path."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function SubjectCover({ previewUrl }) {
  const youtubeId = getYoutubeId(previewUrl);
  const thumb = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null;

  if (!thumb) {
    return <div className="h-40 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400" />;
  }

  return (
    <div className="relative h-40 overflow-hidden bg-slate-100">
      <img
        src={thumb}
        alt="Course thumbnail"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent" />
    </div>
  );
}

function getYoutubeId(url = "") {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.replace("/", "");
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
  } catch (e) {
    return null;
  }
  return null;
}
