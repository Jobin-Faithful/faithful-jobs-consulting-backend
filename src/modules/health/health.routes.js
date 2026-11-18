
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  const status = databaseConnected ? "ok" : "degraded";

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: "Backend health check",
    data: {
      status,
      database: databaseConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
