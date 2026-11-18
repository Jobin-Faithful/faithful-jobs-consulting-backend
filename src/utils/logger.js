
const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "accessToken",
      "refreshToken"
    ],
    censor: "[REDACTED]"
  },

  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
