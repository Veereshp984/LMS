const service = require("./payment.service");

async function createOrder(req, res, next) {
  try {
    const subjectId = Number(req.body?.subject_id);
    if (!subjectId) return res.status(400).json({ message: "subject_id is required" });

    const data = await service.createOrder(req.user.id, subjectId);
    if (!data) return res.status(404).json({ message: "Subject not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function verify(req, res, next) {
  try {
    const data = await service.verifyAndEnroll(req.user.id, req.body || {});
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createOrder, verify };
