const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
    },
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
    location: {
      latitude: Number,
      longitude: Number,
      country: String,
      city: String,
      region: String,
      ip: String
    },
    deviceId: {
      type: String,
      required: true,
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
    status: {
      type: String,
      enum: ["success", "failed", "blocked", "mfa_required"],
      default: "success",
    },
    failureReason: {
      type: String,
      default: null
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low"
    },
    combinedRiskScore: {
      type: Number,
      default: 0,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    keystrokeAnalysis: {
      anomalyScore: { type: Number, default: 0 },
      riskLevel: { type: String, default: "Unknown" },
      confidence: { type: String, default: "Low" }
    },
    travelAnalysis: {
      distanceTraveled: { type: Number, default: 0 },
      timeSinceLastLogin: { type: Number, default: 0 },
      travelSpeed: { type: Number, default: 0 },
      impossibleTravel: { type: Boolean, default: false },
      travelRiskScore: { type: Number, default: 0 }
    },
    temporalAnalysis: {
      loginHour: { type: Number },
      loginDay: { type: Number },
      isUnusualTime: { type: Boolean, default: false }
    },
    threatExplanation: {
      title: { type: String, default: "Login Analysis" },
      riskLevel: { type: String, default: "Normal" },
      reasons: { type: [String], default: [] },
      recommendations: { type: [String], default: [] }
    },
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

// Simple indexes
LoginLogSchema.index({ email: 1 });
LoginLogSchema.index({ createdAt: -1 });
LoginLogSchema.index({ deviceId: 1 });

// NO MIDDLEWARE - Keep it simple!

module.exports = mongoose.model("LoginLog", LoginLogSchema);