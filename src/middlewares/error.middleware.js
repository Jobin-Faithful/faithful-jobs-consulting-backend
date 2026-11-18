
const env = require("../config/env");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl
    },
    "Request error"
  );

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong"
  });
};

module.exports = errorHandler;
