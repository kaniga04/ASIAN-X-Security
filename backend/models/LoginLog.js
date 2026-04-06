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

  // ✅ ADD THESE NEW FIELDS
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

  mitreTactic: String,
  mitreTechnique: String,
  mitreTechniqueId: String,
  anomalyReason: String

}, { timestamps: true });

module.exports = mongoose.model("LoginLog", LoginLogSchema);