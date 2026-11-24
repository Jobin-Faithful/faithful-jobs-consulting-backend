
const Employee = require("../../models/EmployeeProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      skills,
      experience,
      resume,additionalInfo
    } = req.body;

    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      phone,
      skills,
      experience,
      resume,additionalInfo
    });

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        role: "employee",
        tokenVersion: employee.tokenVersion,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Employee login successful",
      token,
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: "employee",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    await Employee.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Employee logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
