const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    email: String,
    role: String,

    /* ================= NETWORK INFO ================= */
    ipAddress: String,
    country: String,
    state: String,

    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },

    /* ================= DEVICE INFO ================= */

    // 🔥 NEW: UNIQUE DEVICE ID
    deviceId: {
      type: String,
      default: null,
    },

    device: {
      type: String,
      default: "Unknown",
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    os: {
      type: String,
      default: "Unknown",
    },

    /* ================= LOGIN STATUS ================= */

    status: {
      type: String,
      default: "success",
    },

    /* ================= RISK ================= */

    riskScore: {
      type: Number,
      default: 0,
    },

    mlScore: Number,

    isAnomaly: {
      type: Boolean,
      default: false,
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    /* ================= MITRE ================= */

    mitreTactic: String,
    mitreTechnique: String,
    mitreTechniqueId: String,
    anomalyReason: String,

    /* ================= THREAT EXPLANATION ================= */

    threatExplanation: {
      title: {
        type: String,
        default: "Login Analysis",
      },
      riskLevel: {
        type: String,
        default: "Normal",
      },
      reasons: {
        type: [String],
        default: [],
      },
      recommendations: {
        type: [String],
        default: [],
      },
    },

    /* ================= USER ACTION ================= */

    isVerifiedByUser: {
      type: Boolean,
      default: null,
    },

    isReported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// 🔥 Faster queries
LoginLogSchema.index({ email: 1 });
LoginLogSchema.index({ createdAt: -1 });

// 🔥 NEW: device tracking
LoginLogSchema.index({ deviceId: 1 });

module.exports = mongoose.model("LoginLog", LoginLogSchema);