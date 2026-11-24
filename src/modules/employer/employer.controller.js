
const Employer = require("../../models/EmployeeProfile");
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
      companyName,
      companyLogo,
      industry,
      website,
      additionalInfo
    } = req.body;

    const existingEmployer = await Employer.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmployer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employer = await Employer.create({
      name,
      email,
      password: hashedPassword,
      phone,
      companyName,
      companyLogo,
      industry,
      website,
      additionalInfo
    });

    return res.status(201).json({
      success: true,
      message: "Employer registered successfully",
      data: {
        id: employer._id,
        name: employer.name,
        email: employer.email,
        companyName: employer.companyName,
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

    const employer = await Employer.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    if (!employer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employer.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: employer._id,
        role: "employer",
        tokenVersion: employer.tokenVersion,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Employer login successful",
      token,
      data: {
        id: employer._id,
        name: employer.name,
        email: employer.email,
        companyName: employer.companyName,
        role: "employer",
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
    await Employer.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Employer logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
