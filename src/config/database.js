
const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (error) => {
      logger.error({ err: error }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection failed");
    throw error;
  }
};

module.exports = connectDatabase;
