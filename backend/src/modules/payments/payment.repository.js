const db = require("../../config/db");

function getPublishedSubjectById(subjectId) {
  return db("subjects")
    .select("id", "title", "price_inr", "is_published")
    .where({ id: subjectId, is_published: 1 })
    .first();
}

function isEnrolled(userId, subjectId) {
  return db("enrollments").where({ user_id: userId, subject_id: subjectId }).first();
}

module.exports = { getPublishedSubjectById, isEnrolled };
