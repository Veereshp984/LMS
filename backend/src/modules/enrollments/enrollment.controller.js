const service = require("./enrollment.service");

async function enroll(req, res, next) {
  try {
    const data = await service.enroll(req.user.id, req.params.subjectId);
    if (!data) return res.status(404).json({ message: "Subject not found" });
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}

async function mine(req, res, next) {
  try {
    const data = await service.listMine(req.user.id);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { enroll, mine };
