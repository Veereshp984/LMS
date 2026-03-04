const repo = require("./progress.repository");
const videoService = require("../videos/video.service");

async function getVideoProgress(userId, videoId) {
  const video = await videoService.validateVideoBelongsToPublishedSubject(videoId);
  if (!video) return null;
  const progress = await repo.getVideoProgress(userId, videoId);
  if (!progress) {
    return { last_position_seconds: 0, is_completed: false };
  }
  return {
    last_position_seconds: progress.last_position_seconds,
    is_completed: Boolean(progress.is_completed),
  };
}

async function saveVideoProgress(userId, videoId, body) {
  const video = await videoService.validateVideoBelongsToPublishedSubject(videoId);
  if (!video) return null;
  const duration = Number(video.duration_seconds || 0);
  const completed = Boolean(body.is_completed);
  let lastPos = Number(body.last_position_seconds || 0);
  if (Number.isNaN(lastPos)) lastPos = 0;
  if (duration > 0) lastPos = Math.min(lastPos, duration);
  lastPos = Math.max(0, lastPos);

  const row = await repo.upsertVideoProgress({
    user_id: userId,
    video_id: Number(videoId),
    last_position_seconds: lastPos,
    is_completed: completed,
    completed_at: completed ? new Date() : null,
  });
  return {
    id: row.id,
    video_id: row.video_id,
    last_position_seconds: row.last_position_seconds,
    is_completed: Boolean(row.is_completed),
  };
}

async function getSubjectProgress(userId, subjectId) {
  const summary = await repo.getSubjectProgressSummary(userId, subjectId);
  const percent_complete =
    summary.total_videos > 0
      ? Math.round((summary.completed_videos / summary.total_videos) * 100)
      : 0;
  return { ...summary, percent_complete };
}

module.exports = { getVideoProgress, saveVideoProgress, getSubjectProgress };
