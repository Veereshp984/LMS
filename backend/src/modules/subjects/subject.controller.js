const service = require("./subject.service");

async function list(req, res, next) {
  try {
    const data = await service.listSubjects(req.query);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getSubject(req.params.subjectId);
    if (!item) return res.status(404).json({ message: "Subject not found" });
    return res.json(item);
  } catch (err) {
    return next(err);
  }
}

async function tree(req, res, next) {
  try {
    const data = await service.getTree(req.params.subjectId, req.user.id);
    if (!data) return res.status(404).json({ message: "Subject not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function firstVideo(req, res, next) {
  try {
    const data = await service.getFirstUnlockedVideo(req.params.subjectId, req.user.id);
    if (!data) return res.status(404).json({ message: "Subject not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, tree, firstVideo };
