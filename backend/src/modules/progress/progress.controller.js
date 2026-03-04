const service = require("./progress.service");

async function getSubjectProgress(req, res, next) {
  try {
    const data = await service.getSubjectProgress(req.user.id, req.params.subjectId);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function getVideoProgress(req, res, next) {
  try {
    const data = await service.getVideoProgress(req.user.id, req.params.videoId);
    if (!data) return res.status(404).json({ message: "Video not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function saveVideoProgress(req, res, next) {
  try {
    const data = await service.saveVideoProgress(req.user.id, req.params.videoId, req.body);
    if (!data) return res.status(404).json({ message: "Video not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSubjectProgress, getVideoProgress, saveVideoProgress };
