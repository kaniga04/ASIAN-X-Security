const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* ================= BASIC INFO ================= */
    email: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      trim: true,
    },

    /* ================= NETWORK INFO ================= */
    ipAddress: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    /* ================= DEVICE INFO ================= */

    // ✅ FIXED: stable device tracking
    deviceId: {
      type: String,
      default: "unknown-device",
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
      enum: ["success", "failed"],
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
      default: null, // null = not reviewed
    },

    isReported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// 🔥 Fast queries
LoginLogSchema.index({ email: 1 });
LoginLogSchema.index({ createdAt: -1 });

// 🔥 Device tracking (fixed)
LoginLogSchema.index({ deviceId: 1 }, { sparse: true });

// 🔥 Detect same user + same device
LoginLogSchema.index({ email: 1, deviceId: 1 });

module.exports = mongoose.model("LoginLog", LoginLogSchema);