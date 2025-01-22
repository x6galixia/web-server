const { NotFoundError } = require("../utils/errors");

const notFoundMiddleware = ((err, req, res, next) => {
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).render("pages/404-page", {
      title: "Page Not Found",
      error: err.message,
      user: req.user || null,
    });
  } else {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = notFoundMiddleware;
