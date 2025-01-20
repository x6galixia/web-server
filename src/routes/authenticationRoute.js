const express = require("express");
const router = express.Router();
const { ensureNotAuthenticated } = require("../middlewares/authMiddleware");
const { signup, login, logout } = require("../controllers/authController");

router.get("/signup", ensureNotAuthenticated, (req, res) => {
  try {
    res.render("pages/signup-page", { title: "Signup page" });
  } catch (err) {
    console.error("Error rendering signup page:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", ensureNotAuthenticated, (req, res) => {
  try {
    res.render("pages/login-page", { title: "Login page" });
  } catch (err) {
    console.error("Error rendering login page:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;