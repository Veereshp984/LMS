const db = require("../../config/db");
const { getSectionsWithVideosBySubjectId } = require("../sections/section.repository");

async function listPublishedSubjects({ page, pageSize, q }) {
  const base = db("subjects").where({ is_published: 1 });
  if (q) {
    base.andWhere((qb) => {
      qb.where("title", "like", `%${q}%`).orWhere("description", "like", `%${q}%`);
    });
  }
  const [{ count }] = await base.clone().count({ count: "id" });
  const items = await base
    .clone()
    .select(
      "id",
      "title",
      "slug",
      "description",
      "price_inr",
      "created_at",
      db.raw(
        `(SELECT v.youtube_url
          FROM sections s
          JOIN videos v ON v.section_id = s.id
          WHERE s.subject_id = subjects.id
          ORDER BY s.order_index ASC, v.order_index ASC
          LIMIT 1) AS preview_youtube_url`
      )
    )
    .orderBy("created_at", "desc")
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    items,
    pagination: { page, pageSize, total: Number(count) },
  };
}

function getPublishedSubjectById(subjectId) {
  return db("subjects")
    .select("id", "title", "slug", "description", "price_inr", "is_published", "created_at", "updated_at")
    .where({ id: subjectId, is_published: 1 })
    .first();
}

async function getSubjectWithTree(subjectId) {
  const subject = await getPublishedSubjectById(subjectId);
  if (!subject) return null;
  const sections = await getSectionsWithVideosBySubjectId(subjectId);
  return { ...subject, sections };
}

module.exports = {
  listPublishedSubjects,
  getPublishedSubjectById,
  getSubjectWithTree,
};
