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

  status: {
    type: String,
    default: "success"
  },

  riskScore: {
    type: Number,
    default: 0
  },

  mlScore: Number,

  isAnomaly: {
    type: Boolean,
    default: false
  },

  resolved: {
    type: Boolean,
    default: false
  },

  mitreTactic: String,
  mitreTechnique: String,
  mitreTechniqueId: String,
  anomalyReason: String,

  latitude: {
  type: Number,
  default: null
},
longitude: {
  type: Number,
  default: null
},

  /* ✅ FIXED: ONLY threat explanation inside */
  threatExplanation: {
    title: {
      type: String,
      default: "Login Analysis"
    },
    riskLevel: {
      type: String,
      default: "Normal"
    },
    reasons: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    }
  },

  /* ✅ CORRECT PLACE (OUTSIDE) */
  isVerifiedByUser: {
    type: Boolean,
    default: null // null = not reviewed
  },

  isReported: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

/* 🔥 INDEXES */
LoginLogSchema.index({ email: 1 });
LoginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LoginLog", LoginLogSchema);