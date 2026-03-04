const express = require("express");
const controller = require("./video.controller");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/:videoId", auth, controller.getById);

module.exports = router;
