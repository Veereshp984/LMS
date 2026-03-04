const db = require("../../config/db");

async function getSectionsWithVideosBySubjectId(subjectId) {
  const sections = await db("sections")
    .select("id", "subject_id", "title", "order_index")
    .where({ subject_id: subjectId })
    .orderBy("order_index", "asc");

  const sectionIds = sections.map((s) => s.id);
  let videos = [];
  if (sectionIds.length > 0) {
    videos = await db("videos")
      .select(
        "id",
        "section_id",
        "title",
        "description",
        "youtube_url",
        "order_index",
        "duration_seconds"
      )
      .whereIn("section_id", sectionIds)
      .orderBy("order_index", "asc");
  }

  const videoMap = videos.reduce((acc, v) => {
    if (!acc[v.section_id]) acc[v.section_id] = [];
    acc[v.section_id].push(v);
    return acc;
  }, {});

  return sections.map((section) => ({
    ...section,
    videos: videoMap[section.id] || [],
  }));
}

module.exports = { getSectionsWithVideosBySubjectId };
