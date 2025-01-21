const express = require("express");
const router = express.Router();

router.use("/", require("./authRoute"));
router.use("/", require("./homeRoute"));
router.use("/", require("./adminRoute"));

module.exports = router;