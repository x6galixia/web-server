const express = require("express");
const router = express.Router();
const { ensureNotAuthenticated } = require("../middlewares/authMiddleware");
const { signup, login, logout } = require("../controllers/authController");

router.get("/signup", ensureNotAuthenticated, (req, res) => {
  const error = req.query.error;
  const success = req.query.success;
  const name = req.query.name;
  const username = req.query.username;
  const email = req.query.email;
  const errorField = req.query.errorField;

  try {
    res.render("pages/signup-page", { title: "Signup page", success, error, name, username, email, errorField });
  } catch (err) {
    console.error("Error rendering signup page:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", ensureNotAuthenticated, (req, res) => {
  const error = req.query.error;
  const success = req.query.success;
  const email = req.query.email;
  const password = req.query.password;
  const errorField = req.query.errorField;

  try {
    res.render("pages/login-page", { title: "Login page", error, errorField, success, email, password });
  } catch (err) {
    console.error("Error rendering login page:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;