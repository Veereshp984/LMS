const express = require("express");
const auth = require("../../middleware/authMiddleware");
const controller = require("./enrollment.controller");

const router = express.Router();

router.post("/:subjectId", auth, controller.enroll);
router.get("/mine", auth, controller.mine);

module.exports = router;
