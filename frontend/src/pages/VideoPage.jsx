import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import apiClient from "../lib/apiClient";
import useSidebarStore from "../store/sidebarStore";
import SubjectSidebar from "../components/Sidebar/SubjectSidebar";
import VideoMeta from "../components/Video/VideoMeta";
import VideoPlayer from "../components/Video/VideoPlayer";
import VideoProgressBar from "../components/Video/VideoProgressBar";
import Alert from "../components/common/Alert";
import { flushProgress, sendProgressDebounced } from "../lib/progress";

export default function VideoPage() {
  const { subjectId, videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tree, setTree, markVideoCompleted } = useSidebarStore();
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState({ last_position_seconds: 0, is_completed: false });
  const [summary, setSummary] = useState({ percent_complete: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const autoplayNext = Boolean(location.state?.autoplayNext);
  const rawPlaylistIndex = Number(searchParams.get("pi") || "0");

  const isLocked = useMemo(() => Boolean(video?.locked), [video]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [treeRes, videoRes, summaryRes] = await Promise.all([
          apiClient.get(`/subjects/${subjectId}/tree`),
          apiClient.get(`/videos/${videoId}`),
          apiClient.get(`/progress/subjects/${subjectId}`),
        ]);
        if (!mounted) return;
        setTree(treeRes.data);
        setVideo(videoRes.data);
        setSummary(summaryRes.data);
        if (!videoRes.data.locked) {
          const progressRes = await apiClient.get(`/progress/videos/${videoId}`);
          if (!mounted) return;
          setProgress(progressRes.data);
        }
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load video page");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [subjectId, videoId, setTree]);

  const handleProgress = (seconds) => {
    setProgress((p) => ({ ...p, last_position_seconds: seconds }));
    sendProgressDebounced(videoId, { last_position_seconds: seconds, is_completed: false });
  };

  const handleCompleted = async () => {
    const nextVideoId = video?.next_video_id;

    markVideoCompleted(videoId);

    try {
      await flushProgress(videoId, {
        last_position_seconds: progress.last_position_seconds,
        is_completed: true,
      });
    } catch (e) {
      // Keep next-video flow working even if progress sync fails.
      console.error("Failed to flush completion progress", e);
    } finally {
      if (nextVideoId) {
        navigate(`/subjects/${subjectId}/video/${nextVideoId}`, { state: { autoplayNext: true } });
      }
    }
  };

  if (loading) return <AppShell>Loading video...</AppShell>;
  const playlistItems = video?.playlist_items || [];
  const playlistIndex =
    Number.isFinite(rawPlaylistIndex) && rawPlaylistIndex >= 0 && rawPlaylistIndex < playlistItems.length
      ? rawPlaylistIndex
      : 0;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SubjectSidebar tree={tree} subjectId={subjectId} currentVideoId={videoId} />
        <div className="space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          {video ? <VideoMeta title={video.title} description={video.description} /> : null}
          {isLocked ? (
            <Alert>Complete previous video</Alert>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <VideoPlayer
                key={`${videoId}-${playlistIndex}`}
                videoId={null}
                youtubeUrl={video?.youtube_url}
                startPositionSeconds={progress.last_position_seconds}
                playlistIndex={playlistIndex}
                autoplay={autoplayNext}
                onProgress={handleProgress}
                onCompleted={handleCompleted}
              />
            </div>
          )}
          {playlistItems.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-slate-800">
                Playlist Videos ({playlistItems.length})
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {playlistItems.map((item, index) => {
                  const active = index === playlistIndex;
                  return (
                    <button
                      key={item.youtube_video_id}
                      type="button"
                      onClick={() => setSearchParams({ pi: String(index) })}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        active
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {index + 1}. {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <VideoProgressBar percent={summary.percent_complete} />
        </div>
      </div>
    </AppShell>
  );
}
