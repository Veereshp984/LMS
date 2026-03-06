const express = require("express");
const auth = require("../../middleware/authMiddleware");
const controller = require("./payment.controller");

const router = express.Router();

router.post("/orders", auth, controller.createOrder);
router.post("/verify", auth, controller.verify);

module.exports = router;
