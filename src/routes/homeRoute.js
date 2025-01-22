const express = require("express");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureAdminOrUser } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/home", ensureAuthenticated, ensureAdminOrUser, (req, res, next) => {
  const error = req.query.error;
  try {
    // Only pass the error to the template if it exists in the query parameters
    if (error) {
      res.render("pages/home-page", { title: "Home page", user: req.user, error });
    } else {
      res.render("pages/home-page", { title: "Home page", user: req.user });
    }
  } catch (err) {
    console.error("Error rendering home page:", err);
    next(err);
  }
});

module.exports = router;