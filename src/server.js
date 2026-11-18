
const http = require("http");

const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/database");
const logger = require("./utils/logger");

let server;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();

    // Start HTTP server
    server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(
        `Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });

    server.on("error", (error) => {
      logger.fatal({ err: error }, "HTTP server error");
      process.exit(1);
    });

  } catch (error) {
    logger.fatal({ err: error }, "Application startup failed");
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown.`);

  if (!server) {
    await require("mongoose").disconnect();
    process.exit(0);
  }

  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, "Server shutdown error");
      process.exit(1);
    }

    try {
      await require("mongoose").disconnect();
      logger.info("Database disconnected. Shutdown complete.");
      process.exit(0);
    } catch (dbError) {
      logger.error({ err: dbError }, "Database shutdown error");
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

startServer();
