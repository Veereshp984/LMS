const repo = require("./video.repository");
const db = require("../../config/db");
const { buildGlobalSequence, getPrevNext, isUnlocked } = require("../../utils/ordering");

async function getVideoDetails(videoId, userId) {
  const video = await repo.getVideoById(videoId);
  if (!video || !video.is_published) return null;

  const sections = await repo.getSubjectTreeForVideo(video.subject_id);
  const sequence = buildGlobalSequence(sections);
  const neighbors = getPrevNext(sequence, video.id);

  const completedRows = await db("video_progress")
    .select("video_id")
    .where({ user_id: userId, is_completed: 1 });
  const completedSet = new Set(completedRows.map((r) => Number(r.video_id)));
  const unlockedState = isUnlocked(sequence, video.id, completedSet);

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
