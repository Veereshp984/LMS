const db = require("../../config/db");

function getPublishedSubjectById(subjectId) {
  return db("subjects").select("id").where({ id: subjectId, is_published: 1 }).first();
}

function createEnrollment(userId, subjectId) {
  return db("enrollments")
    .insert({ user_id: userId, subject_id: subjectId })
    .onConflict(["user_id", "subject_id"])
    .ignore();
}

function listEnrolledSubjects(userId) {
  return db("enrollments as e")
    .join("subjects as s", "s.id", "e.subject_id")
    .select(
      "s.id",
      "s.title",
      "s.slug",
      "s.description",
      "s.price_inr",
      "e.created_at as enrolled_at",
      db.raw(
        `(SELECT v.youtube_url
          FROM sections sec
          JOIN videos v ON v.section_id = sec.id
          WHERE sec.subject_id = s.id
          ORDER BY sec.order_index ASC, v.order_index ASC
          LIMIT 1) AS preview_youtube_url`
      )
    )
    .where({ "e.user_id": userId, "s.is_published": 1 })
    .orderBy("e.created_at", "desc");
}

module.exports = {
  getPublishedSubjectById,
  createEnrollment,
  listEnrolledSubjects,
};
