const express = require("express");
const router = express.Router();

router.use("/", require("./authenticationRoute"));
router.use("/", require("./homeRoute"));
router.use("/", require("./adminRoute"));

module.exports = router;