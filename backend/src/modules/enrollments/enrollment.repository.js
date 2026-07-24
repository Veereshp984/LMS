const db = require("../../config/db");
const { hasColumn } = require("../../utils/schema");
const { mapSubjectPrice } = require("../../utils/subjectSelects");

function getPublishedSubjectById(subjectId) {
  return db("subjects").select("id").where({ id: subjectId, is_published: 1 }).first();
}

function createEnrollment(userId, subjectId) {
  return db("enrollments")
    .insert({ user_id: userId, subject_id: subjectId })
    .onConflict(["user_id", "subject_id"])
    .ignore();
}

function isEnrolled(userId, subjectId) {
  return db("enrollments").where({ user_id: userId, subject_id: subjectId }).first();
}

async function listEnrolledSubjects(userId) {
  const selectColumns = [
    "s.id",
    "s.title",
    "s.slug",
    "s.description",
    "e.created_at as enrolled_at",
    db.raw(
      `(SELECT v.youtube_url
        FROM sections sec
        JOIN videos v ON v.section_id = sec.id
        WHERE sec.subject_id = s.id
        ORDER BY sec.order_index ASC, v.order_index ASC
        LIMIT 1) AS preview_youtube_url`
    ),
  ];
  if (await hasColumn("subjects", "price_inr")) {
    selectColumns.splice(4, 0, "s.price_inr");
  }

  const rows = await db("enrollments as e")
    .join("subjects as s", "s.id", "e.subject_id")
    .select(...selectColumns)
    .where({ "e.user_id": userId, "s.is_published": 1 })
    .orderBy("e.created_at", "desc");

  return mapSubjectPrice(rows);
}

module.exports = {
  getPublishedSubjectById,
  createEnrollment,
  isEnrolled,
  listEnrolledSubjects,
};
