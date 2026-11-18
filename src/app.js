
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");

const env = require("./config/env");
const logger = require("./utils/logger");

const healthRoutes = require("./modules/health/health.routes");
const notFoundHandler = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

// Security headers
app.use(helmet());

// Frontend communication
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === `${env.API_PREFIX}/health`
    }
  })
);

// Response compression
app.use(compression());

// Request body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parsing
app.use(cookieParser());

// API routes
app.use(`${env.API_PREFIX}/health`, healthRoutes);

app.use(`${env.API_PREFIX}/auth`, authRoutes);

// 404 handler - must be last
app.use(notFoundHandler);

// Error handler - must be after 404
app.use(errorHandler);

module.exports = app;
