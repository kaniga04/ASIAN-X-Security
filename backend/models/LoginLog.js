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

    // 🌐 IP ADDRESS
    ipAddress: {
      type: String,
      default: null,
  
    },

    // 🌍 GEO LOCATION
    country: {
      type: String,
      default: "Unknown",
  
    },

    city: {
      type: String,
      default: null
    },

    userAgent: {
      type: String,
      default: null
    },

    // LOGIN STATUS
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true
    },

    // 📊 Risk Analysis
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

// 🔎 Indexes for SIEM dashboard analytics
loginLogSchema.index({ createdAt: -1 });
loginLogSchema.index({ email: 1 });
loginLogSchema.index({ ipAddress: 1 });
loginLogSchema.index({ country: 1 });

module.exports = mongoose.model("LoginLog", loginLogSchema);