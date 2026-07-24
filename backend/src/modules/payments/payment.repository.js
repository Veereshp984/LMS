const db = require("../../config/db");
const { getSubjectSelectColumns, mapSubjectPrice } = require("../../utils/subjectSelects");

async function getPublishedSubjectById(subjectId) {
  const columns = await getSubjectSelectColumns(["is_published"]);
  const subject = await db("subjects")
    .select(...columns)
    .where({ id: subjectId, is_published: 1 })
    .first();
  return mapSubjectPrice(subject ? [subject] : [])[0] || null;
}

function isEnrolled(userId, subjectId) {
  return db("enrollments").where({ user_id: userId, subject_id: subjectId }).first();
}

module.exports = { getPublishedSubjectById, isEnrolled };
