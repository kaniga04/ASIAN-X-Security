const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  email: String,
  role: String,

  ipAddress: String,
  country: String,
  state: String,

  // ✅ DEVICE INFO
  device: {
    type: String,
    default: "Unknown"
  },

  browser: {
    type: String,
    default: "Unknown"
  },

  os: {
    type: String,
    default: "Unknown"
  },

  status: String,

  riskScore: Number,
  mlScore: Number,

  isAnomaly: Boolean,

  resolved: {
    type: Boolean,
    default: false
  },

  // ✅ MITRE (optional - keep if using)
  mitreTactic: String,
  mitreTechnique: String,
  mitreTechniqueId: String,
  anomalyReason: String,

  // 🔥 NEW: THREAT EXPLANATION FEATURE
  threatExplanation: {
    title: String,
    riskLevel: String,
    reasons: [String],
    recommendations: [String]
  }

}, { timestamps: true });

module.exports = mongoose.model("LoginLog", LoginLogSchema);