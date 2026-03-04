const db = require("../../config/db");

function getVideoProgress(userId, videoId) {
  return db("video_progress").where({ user_id: userId, video_id: videoId }).first();
}

async function upsertVideoProgress({
  user_id,
  video_id,
  last_position_seconds,
  is_completed,
  completed_at,
}) {
  const existing = await getVideoProgress(user_id, video_id);
  if (existing) {
    await db("video_progress")
      .where({ user_id, video_id })
      .update({
        last_position_seconds,
        is_completed,
        completed_at,
        updated_at: new Date(),
      });
    return getVideoProgress(user_id, video_id);
  }
  const [id] = await db("video_progress").insert({
    user_id,
    video_id,
    last_position_seconds,
    is_completed,
    completed_at,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return db("video_progress").where({ id }).first();
}

async function getSubjectProgressSummary(userId, subjectId) {
  const totalRow = await db("videos")
    .join("sections", "videos.section_id", "sections.id")
    .where("sections.subject_id", subjectId)
    .count({ count: "videos.id" })
    .first();

  const completedRow = await db("video_progress")
    .join("videos", "video_progress.video_id", "videos.id")
    .join("sections", "videos.section_id", "sections.id")
    .where("video_progress.user_id", userId)
    .andWhere("video_progress.is_completed", 1)
    .andWhere("sections.subject_id", subjectId)
    .count({ count: "video_progress.id" })
    .first();

  const last = await db("video_progress")
    .join("videos", "video_progress.video_id", "videos.id")
    .join("sections", "videos.section_id", "sections.id")
    .where("video_progress.user_id", userId)
    .andWhere("sections.subject_id", subjectId)
    .orderBy("video_progress.updated_at", "desc")
    .select("video_progress.video_id as last_video_id", "video_progress.last_position_seconds")
    .first();

  return {
    total_videos: Number(totalRow?.count || 0),
    completed_videos: Number(completedRow?.count || 0),
    last_video_id: last?.last_video_id || null,
    last_position_seconds: last?.last_position_seconds || 0,
  };
}

module.exports = { getVideoProgress, upsertVideoProgress, getSubjectProgressSummary };
