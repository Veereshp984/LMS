const db = require("../../config/db");
const { getSectionsWithVideosBySubjectId } = require("../sections/section.repository");

async function listPublishedSubjects({ page, pageSize, q }) {
  const base = db("subjects").where({ is_published: 1 });
  if (q) {
    base.andWhere((qb) => {
      qb.where("title", "like", `%${q}%`).orWhere("description", "like", `%${q}%`);
    });
  }
  const [countRows, subjects] = await Promise.all([
    base.clone().count({ count: "id" }),
    base
      .clone()
      .select("id", "title", "slug", "description", "price_inr", "created_at")
      .orderBy("created_at", "desc")
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  if (!subjects.length) {
    return {
      items: [],
      pagination: { page, pageSize, total: Number(countRows?.[0]?.count || 0) },
    };
  }

  const subjectIds = subjects.map((subject) => Number(subject.id));
  const previewRows = await db("sections as s")
    .clone()
    .select("s.subject_id", "v.youtube_url")
    .join("videos as v", "v.section_id", "s.id")
    .whereIn("s.subject_id", subjectIds)
    .orderBy("s.subject_id", "asc")
    .orderBy("s.order_index", "asc")
    .orderBy("v.order_index", "asc");

  const previewBySubject = new Map();
  for (const row of previewRows) {
    const sid = Number(row.subject_id);
    if (!previewBySubject.has(sid)) {
      previewBySubject.set(sid, row.youtube_url || null);
    }
  }

  const items = subjects.map((subject) => ({
    ...subject,
    preview_youtube_url: previewBySubject.get(Number(subject.id)) || null,
  }));

  return {
    items,
    pagination: { page, pageSize, total: Number(countRows?.[0]?.count || 0) },
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
