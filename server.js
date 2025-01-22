const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const compression = require("compression");
const morgan = require("morgan");
const winston = require("winston");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const DailyRotateFile = require("winston-daily-rotate-file");
const crypto = require("crypto");
const db = require("./src/config/db");
const fs = require("fs");
const session = require("express-session");
const passport = require("./src/config/passportConfig");
const validateEnvVars = require("./src/utils/envValidator");
const { NotFoundError } = require("./src/utils/errors");
const notFoundMiddleware = require('./src/middlewares/errorMiddleware');

require("dotenv").config();

validateEnvVars();

const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: `${logDir}/application-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
    }),
    ...(process.env.NODE_ENV === "development"
      ? [new winston.transports.Console({ format: winston.format.simple() })]
      : []),
  ],
});

logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

const app = express();

app.use((req, res, next) => {
  req.id = uuidv4();
  logger.info({ message: `Request started`, requestId: req.id, url: req.url });
  next();
});

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS.split(",")
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 200,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", apiLimiter);

app.use(express.static(path.join(__dirname, "dist")));
app.use("/uploads", express.static("uploads"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${nonce}';`
  );
  next();
});

// Routes
const routes = require("./src/routes/index");
app.use("/", routes);

// Redirect route (fixed parameters)
app.get("/server", (req, res, next) => {
  try {
    res.redirect("/login");
  } catch (err) {
    console.error("Error redirecting to signup, ", err);
    next(err);
  }
});

// 404 Handler (after routes)
app.use((req, res, next) => {
  next(new NotFoundError("The requested URL was not found on this server."));
});

app.use(notFoundMiddleware);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    userId: req.user?.id,
  });

  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: errorMessage,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await db.end();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
