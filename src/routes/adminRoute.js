const express = require("express");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get( "/dashboard", ensureAuthenticated, ensureAdmin, (req, res, next) => {
  const error = req.query.error;
  try {
    // Only pass the error to the template if it exists in the query parameters
    if (error) {
      res.render("pages/admin-page", { title: "Dashboard", user: req.user, error });
    } else {
      res.render("pages/admin-page", { title: "Dashboard", user: req.user });
    }
  } catch (err) {
    console.error("Error rendering dashboard page:", err);
    next(err);
  }
  }
);

module.exports = router;