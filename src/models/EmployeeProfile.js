
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    skills: [{
      type: String,
    }],

    experience: {
      type: Number,
      default: 0,
    },

    resume: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
    additionalInfo: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
