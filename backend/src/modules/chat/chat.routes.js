const express = require("express");
const { ask } = require("./chat.controller");

const router = express.Router();

router.post("/", ask);

module.exports = router;
