import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import apiClient from "../lib/apiClient";
import Alert from "../components/common/Alert";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/subjects?page=1&pageSize=20")
      .then((res) => setSubjects(res.data.items || []))
      .catch(() => setError("Failed to load subjects"));
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="brand-gradient rounded-2xl px-6 py-8 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-100">Online Learning</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
            Learn job-ready skills with structured courses
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-50">
            Explore subjects, follow guided video sequences, and resume exactly where you paused.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Top Subjects</h2>
            <span className="text-sm font-medium text-slate-500">{subjects.length} available</span>
          </div>
        {error ? <Alert>{error}</Alert> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <SubjectCover previewUrl={subject.preview_youtube_url} />
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Guided Course</p>
                <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-blue-700">
                  {subject.title}
                </h3>
                <p className="text-sm text-slate-600">
                  Start learning with a locked sequence path and track your completion.
                </p>
              </div>
            </Link>
          ))}
        </div>
        </section>
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
