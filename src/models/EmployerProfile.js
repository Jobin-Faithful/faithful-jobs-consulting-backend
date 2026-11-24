
const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(
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

        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        companyLogo: {
            type: String,
            default: "",
        },

        industry: {
            type: String,
            default: "",
        },

        website: {
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

module.exports = mongoose.model("Employer", employerSchema);
