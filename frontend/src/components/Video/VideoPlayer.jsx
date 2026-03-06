import { useEffect, useRef } from "react";
import YouTube from "react-youtube";

function getYoutubePlaylistIdFromUrl(url = "") {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("list");
  } catch (e) {
    return null;
  }
  return null;
}

function getYoutubeIdFromUrl(url = "") {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
  } catch (e) {
    return null;
  }
  return null;
}

export default function VideoPlayer({
  videoId,
  youtubeUrl,
  startPositionSeconds = 0,
  onProgress,
  onCompleted,
}) {
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const ytVideoId = videoId || getYoutubeIdFromUrl(youtubeUrl);
  const ytPlaylistId = getYoutubePlaylistIdFromUrl(youtubeUrl);

  const flushProgress = async () => {
    if (!playerRef.current) return;
    const seconds = await playerRef.current.getCurrentTime();
    onProgress?.(Math.floor(seconds || 0));
  };

  const clearTicker = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTicker();
      flushProgress();
    };
  }, []);

  if (!ytVideoId && !ytPlaylistId) {
    return <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">Video unavailable</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-black">
      <YouTube
        videoId={ytVideoId || undefined}
        opts={{
          width: "100%",
          height: "480",
          playerVars: {
            start: startPositionSeconds || 0,
            ...(ytPlaylistId ? { listType: "playlist", list: ytPlaylistId } : {}),
          },
        }}
        onReady={(event) => {
          playerRef.current = event.target;
        }}
        onPlay={() => {
          clearTicker();
          timerRef.current = setInterval(async () => {
            if (!playerRef.current) return;
            const current = await playerRef.current.getCurrentTime();
            onProgress?.(Math.floor(current || 0));
          }, 5000);
        }}
        onPause={() => {
          clearTicker();
          flushProgress();
        }}
        onEnd={() => {
          clearTicker();
          flushProgress();
          onCompleted?.();
        }}
      />
    </div>
  );
}
