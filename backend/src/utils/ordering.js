function buildGlobalSequence(sections) {
  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index);
  const sequence = [];
  sortedSections.forEach((section) => {
    const videos = [...(section.videos || [])].sort((a, b) => a.order_index - b.order_index);
    videos.forEach((video) => {
      sequence.push({ ...video, section_id: section.id, section_title: section.title });
    });
  });
  return sequence;
}

function getPrevNext(sequence, videoId) {
  const idx = sequence.findIndex((v) => Number(v.id) === Number(videoId));
  if (idx < 0) return { previous_video_id: null, next_video_id: null, index: -1 };
  return {
    previous_video_id: sequence[idx - 1]?.id || null,
    next_video_id: sequence[idx + 1]?.id || null,
    index: idx,
  };
}

function prerequisiteFor(sequence, videoId) {
  return getPrevNext(sequence, videoId).previous_video_id;
}

function isUnlocked(sequence, videoId, completedIdsSet) {
  const prerequisite_video_id = prerequisiteFor(sequence, videoId);
  if (!prerequisite_video_id) {
    return { locked: false, unlock_reason: "first_video" };
  }
  const completed = completedIdsSet.has(Number(prerequisite_video_id));
  return {
    locked: !completed,
    unlock_reason: completed ? "prerequisite_completed" : "complete_previous_video",
  };
}

module.exports = {
  buildGlobalSequence,
  getPrevNext,
  prerequisiteFor,
  isUnlocked,
};
