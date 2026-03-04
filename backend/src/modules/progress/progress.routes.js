const express = require("express");
const controller = require("./progress.controller");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/subjects/:subjectId", auth, controller.getSubjectProgress);
router.get("/videos/:videoId", auth, controller.getVideoProgress);
router.post("/videos/:videoId", auth, controller.saveVideoProgress);

module.exports = router;
