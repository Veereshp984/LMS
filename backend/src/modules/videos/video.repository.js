const db = require("../../config/db");
const { getSectionsWithVideosBySubjectId } = require("../sections/section.repository");

function getVideoById(videoId) {
  return db("videos")
    .join("sections", "videos.section_id", "sections.id")
    .join("subjects", "sections.subject_id", "subjects.id")
    .select(
      "videos.id",
      "videos.title",
      "videos.description",
      "videos.youtube_url",
      "videos.order_index",
      "videos.duration_seconds",
      "videos.section_id",
      "sections.title as section_title",
      "subjects.id as subject_id",
      "subjects.title as subject_title",
      "subjects.is_published"
    )
    .where("videos.id", videoId)
    .first();
}

function getSubjectTreeForVideo(subjectId) {
  return getSectionsWithVideosBySubjectId(subjectId);
}

module.exports = { getVideoById, getSubjectTreeForVideo };
