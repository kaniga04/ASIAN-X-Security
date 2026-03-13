const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    ipAddress: {
      type: String,
      default: null
    },

    country: {
      type: String,
      default: "Unknown"
    },

    city: {
      type: String,
      default: null
    },

    userAgent: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true
    },

    // 📊 Risk & ML
    riskScore: {
      type: Number,
      default: 0
    },

    mlScore: {
      type: Number,
      default: 0
    },

    isAnomaly: {
      type: Boolean,
      default: false
    },

    // 🎯 MITRE ATT&CK Mapping
    mitreTactic: {
      type: String,
      default: null
    },

    mitreTechnique: {
      type: String,
      default: null
    },

    mitreTechniqueId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Index for faster dashboard analytics
loginLogSchema.index({ createdAt: -1 });
loginLogSchema.index({ email: 1 });
loginLogSchema.index({ ipAddress: 1 });

module.exports = mongoose.model("LoginLog", loginLogSchema);
