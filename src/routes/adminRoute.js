const express = require("express");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get( "/dashboard", ensureAuthenticated, ensureAdmin, (req, res, next) => {
    try {
      res.render("pages/admin-page", { title: "Dashboard page", user: req.user });
    } catch (err) {
      console.error("Error rendering dasboard page:", err);
      next(err);
    }
  }
);

module.exports = router;