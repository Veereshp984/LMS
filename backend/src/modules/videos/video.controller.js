const service = require("./video.service");

async function getById(req, res, next) {
  try {
    const data = await service.getVideoDetails(req.params.videoId, req.user.id);
    if (!data) return res.status(404).json({ message: "Video not found" });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getById };
