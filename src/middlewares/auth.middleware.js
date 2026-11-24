
const jwt = require("jsonwebtoken");
const Employer = require("../models/EmployerProfile");
const Employee = require("../models/EmployeeProfile");

exports.authMiddleware = (role) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const Model = role === "employer" ? Employer : Employee;

    const user = await Model.findById(decoded.id).select(
      "_id isActive tokenVersion"
    );

    if (
      !user ||
      !user.isActive ||
      user.tokenVersion !== decoded.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    req.user = {
      id: user._id,
      role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
