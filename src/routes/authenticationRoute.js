const express = require("express");
const router = express.Router();
const { ensureNotAuthenticated } = require("../middlewares/authMiddleware");
const { signup, login, logout } = require("../controllers/authController");

router.get("/signup", ensureNotAuthenticated, (req, res) => {
  const error = req.query.error;
  const success = req.query.success;

  try {
    res.render("pages/signup-page", { title: "Signup page", success, error });
  } catch (err) {
    console.error("Error rendering signup page:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", ensureNotAuthenticated, (req, res) => {
  const error = req.query.error;
  const success = req.query.success;

  try {
    res.render("pages/login-page", { title: "Login page", error, success });
  } catch (err) {
    console.error("Error rendering login page:", err);
    res.status(500).send("Internal Server Error");
  }

});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;