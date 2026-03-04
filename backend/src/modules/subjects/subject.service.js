const db = require("../../config/db");
const repo = require("./subject.repository");
const { buildGlobalSequence, isUnlocked } = require("../../utils/ordering");

async function listSubjects(query) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize || 10)));
  const q = query.q ? String(query.q).trim() : "";
  return repo.listPublishedSubjects({ page, pageSize, q });
}

async function getSubject(subjectId) {
  return repo.getPublishedSubjectById(subjectId);
}

async function getTree(subjectId, userId) {
  const tree = await repo.getSubjectWithTree(subjectId);
  if (!tree) return null;
  const sequence = buildGlobalSequence(tree.sections);
  const completedRows = await db("video_progress")
    .select("video_id")
    .where({ user_id: userId, is_completed: 1 });
  const completedSet = new Set(completedRows.map((r) => Number(r.video_id)));

  return {
    id: tree.id,
    title: tree.title,
    sections: tree.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order_index: section.order_index,
      videos: section.videos.map((video) => {
        const unlockedState = isUnlocked(sequence, video.id, completedSet);
        const is_completed = completedSet.has(Number(video.id));
        return {
          id: video.id,
          title: video.title,
          order_index: video.order_index,
          is_completed,
          locked: unlockedState.locked,
        };
      }),
    })),
  };
}

async function getFirstUnlockedVideo(subjectId, userId) {
  const tree = await repo.getSubjectWithTree(subjectId);
  if (!tree) return null;
  const sequence = buildGlobalSequence(tree.sections);
  const completedRows = await db("video_progress")
    .select("video_id")
    .where({ user_id: userId, is_completed: 1 });
  const completedSet = new Set(completedRows.map((r) => Number(r.video_id)));
  const first = sequence.find((video) => !isUnlocked(sequence, video.id, completedSet).locked);
  return first ? { video_id: first.id } : { video_id: null };
}

module.exports = { listSubjects, getSubject, getTree, getFirstUnlockedVideo };
