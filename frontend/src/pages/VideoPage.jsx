import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { tree, setTree, markVideoCompleted } = useSidebarStore();
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState({ last_position_seconds: 0, is_completed: false });
  const [summary, setSummary] = useState({ percent_complete: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    await flushProgress(videoId, { last_position_seconds: progress.last_position_seconds, is_completed: true });
    markVideoCompleted(videoId);
    if (video?.next_video_id) {
      navigate(`/subjects/${subjectId}/video/${video.next_video_id}`);
    }
  };

  if (loading) return <AppShell>Loading video...</AppShell>;

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
                videoId={null}
                youtubeUrl={video?.youtube_url}
                startPositionSeconds={progress.last_position_seconds}
                onProgress={handleProgress}
                onCompleted={handleCompleted}
              />
            </div>
          )}
          <VideoProgressBar percent={summary.percent_complete} />
        </div>
      </div>
    </AppShell>
  );
}
