const repo = require("./video.repository");
const db = require("../../config/db");
const enrollmentRepo = require("../enrollments/enrollment.repository");
const { buildGlobalSequence, getPrevNext, isUnlocked } = require("../../utils/ordering");
const { extractPlaylistId, fetchPlaylistItems } = require("../../utils/youtubePlaylist");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getVideoDetails(videoId, userId) {
  const video = await repo.getVideoById(videoId);
  if (!video || !video.is_published) return null;
  const enrolled = await enrollmentRepo.isEnrolled(userId, video.subject_id);
  if (!enrolled) throw createHttpError(403, "Purchase the course");

  const sections = await repo.getSubjectTreeForVideo(video.subject_id);
  const sequence = buildGlobalSequence(sections);
  const neighbors = getPrevNext(sequence, video.id);

  const completedRows = await db("video_progress")
    .select("video_id")
    .where({ user_id: userId, is_completed: 1 });
  const completedSet = new Set(completedRows.map((r) => Number(r.video_id)));
  const unlockedState = isUnlocked(sequence, video.id, completedSet);
  const playlistId = extractPlaylistId(video.youtube_url || "");
  const playlistItems = playlistId ? await fetchPlaylistItems(playlistId) : [];

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_url: video.youtube_url,
    order_index: video.order_index,
    duration_seconds: video.duration_seconds,
    section_id: video.section_id,
    section_title: video.section_title,
    subject_id: video.subject_id,
    subject_title: video.subject_title,
    previous_video_id: neighbors.previous_video_id,
    next_video_id: neighbors.next_video_id,
    locked: unlockedState.locked,
    unlock_reason: unlockedState.unlock_reason,
    playlist_id: playlistId,
    playlist_items: playlistItems,
  };
}

async function validateVideoBelongsToPublishedSubject(videoId) {
  const video = await repo.getVideoById(videoId);
  if (!video || !video.is_published) return null;
  return video;
}

module.exports = {
  getVideoDetails,
  validateVideoBelongsToPublishedSubject,
};
