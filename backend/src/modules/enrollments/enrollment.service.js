const repo = require("./enrollment.repository");

async function enroll(userId, subjectId) {
  const subject = await repo.getPublishedSubjectById(subjectId);
  if (!subject) return null;
  await repo.createEnrollment(userId, subjectId);
  return { enrolled: true, subject_id: Number(subjectId) };
}

async function listMine(userId) {
  const items = await repo.listEnrolledSubjects(userId);
  return { items };
}

module.exports = { enroll, listMine };
