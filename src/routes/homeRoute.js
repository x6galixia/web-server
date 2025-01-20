const express = require("express");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureAdminOrUser } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get( "/home", ensureAuthenticated, ensureAdminOrUser, (req, res, next) => {
    try {
      res.render("pages/home-page", { title: "Home page" });
    } catch (err) {
      console.error("Error rendering home page:", err);
      next(err);
    }
  }
);

module.exports = router;
