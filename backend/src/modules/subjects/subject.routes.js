const express = require("express");
const controller = require("./subject.controller");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.list);
router.get("/:subjectId", controller.getById);
router.get("/:subjectId/tree", auth, controller.tree);
router.get("/:subjectId/first-video", auth, controller.firstVideo);

module.exports = router;
