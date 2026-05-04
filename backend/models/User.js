const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    // ✅ OTP + Verification
    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    lastLoginIP: {
      type: String,
      default: null
    },

    lastLoginCountry: {
      type: String,
      default: null
    },

    // 🆕 BEHAVIORAL BIOMETRICS PROFILE
    behavioralProfile: {
      // Keystroke dynamics signatures collection
      keystrokeSignatures: [{
        signatureHash: {
          type: String,
          required: true
        },
        dwellTimes: [{
          key: String,
          duration: Number
        }],
        flightTimes: [{
          from: String,
          to: String,
          duration: Number
        }],
        avgDwellTime: {
          type: Number,
          default: 0
        },
        avgFlightTime: {
          type: Number,
          default: 0
        },
        typingSpeed: {
          type: Number,
          default: 0
        },
        totalTypingTime: {
          type: Number
        },
        keyCount: {
          type: Number
        },
        keySequence: {
          type: String
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        deviceId: {
          type: String
        },
        loginSuccess: {
          type: Boolean,
          default: true
        },
        ipAddress: {
          type: String
        }
      }],
      
      // Baseline typing profile (calculated from signatures)
      baselineProfile: {
        avgDwellTime: {
          type: Number,
          default: 0
        },
        avgFlightTime: {
          type: Number,
          default: 0
        },
        avgTypingSpeed: {
          type: Number,
          default: 0
        },
        stdDevDwell: {
          type: Number,
          default: 0
        },
        stdDevFlight: {
          type: Number,
          default: 0
        },
        confidence: {
          type: Number,
          default: 0,
          min: 0,
          max: 1
        },
        lastUpdated: {
          type: Date,
          default: Date.now
        },
        sampleCount: {
          type: Number,
          default: 0
        },
        isReliable: {
          type: Boolean,
          default: false
        },
        trainingStatus: {
          level: String,
          description: String,
          progress: Number
        }
      },

      // 🆕 ML MODEL STORAGE (Enhanced Training)
      mlModel: {
        dwell: {
          mean: Number,
          stdDev: Number,
          min: Number,
          max: Number,
          count: Number,
          outlierCount: Number,
          outlierPercentage: Number
        },
        flight: {
          mean: Number,
          stdDev: Number,
          min: Number,
          max: Number,
          count: Number,
          outlierCount: Number,
          outlierPercentage: Number
        },
        speed: {
          mean: Number,
          stdDev: Number,
          min: Number,
          max: Number,
          count: Number
        },
        sampleSize: Number,
        confidence: Number,
        consistencyScore: Number,
        isReliable: Boolean,
        lastUpdated: Date,
        trainingStatus: {
          level: String,
          description: String,
          progress: Number
        }
      },
      
      // Travel history for impossible travel detection
      travelHistory: [{
        fromLocation: {
          latitude: Number,
          longitude: Number,
          country: String,
          city: String,
          region: String,
          ip: String
        },
        toLocation: {
          latitude: Number,
          longitude: Number,
          country: String,
          city: String,
          region: String,
          ip: String
        },
        distance: {
          type: Number,
          default: 0
        },
        timeDiff: {
          type: Number,
          default: 0
        },
        travelSpeed: {
          type: Number,
          default: 0
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        flagged: {
          type: Boolean,
          default: false
        },
        flagReason: {
          type: String,
          default: null
        },
        deviceId: String,
        loginId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LoginLog'
        }
      }],
      
      // Device trust score history
      deviceTrustScores: [{
        deviceId: String,
        trustScore: {
          type: Number,
          min: 0,
          max: 100
        },
        firstSeen: Date,
        lastSeen: Date,
        loginCount: {
          type: Number,
          default: 0
        },
        isTrusted: {
          type: Boolean,
          default: false
        }
      }],
      
      // Risk profile summary
      riskProfile: {
        overallRiskScore: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        riskLevel: {
          type: String,
          enum: ['Low', 'Medium', 'High', 'Critical'],
          default: 'Low'
        },
        lastAssessed: Date,
        highRiskCount: {
          type: Number,
          default: 0
        },
        blockedAttempts: {
          type: Number,
          default: 0
        }
      }
    },

    // 🆕 SECURITY PREFERENCES
    securityPreferences: {
      enableKeystrokeBiometrics: {
        type: Boolean,
        default: true
      },
      enableTravelDetection: {
        type: Boolean,
        default: true
      },
      mfaRequiredForHighRisk: {
        type: Boolean,
        default: true
      },
      alertOnNewDevice: {
        type: Boolean,
        default: true
      },
      alertOnImpossibleTravel: {
        type: Boolean,
        default: true
      },
      maxFailedAttempts: {
        type: Number,
        default: 5
      },
      sessionTimeoutMinutes: {
        type: Number,
        default: 30
      }
    },

    // 🆕 LOGIN ATTEMPT TRACKING
    loginAttempts: {
      failedAttempts: {
        type: Number,
        default: 0
      },
      lastFailedAttempt: Date,
      lockedUntil: Date,
      totalSuccessfulLogins: {
        type: Number,
        default: 0
      },
      lastSuccessfulLogin: Date,
      consecutiveFailures: {
        type: Number,
        default: 0
      }
    },

    // 🆕 TRUSTED LOCATIONS & DEVICES
    trustedFactors: {
      trustedLocations: [{
        city: String,
        country: String,
        latitude: Number,
        longitude: Number,
        radius: Number,
        addedAt: Date,
        label: String
      }],
      trustedIPs: [{
        ip: String,
        label: String,
        addedAt: Date
      }],
      trustedDevices: [{
        deviceId: String,
        deviceName: String,
        deviceType: String,
        browser: String,
        os: String,
        firstUsed: Date,
        lastUsed: Date,
        isTrusted: Boolean,
        trustLevel: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
          default: 'Medium'
        }
      }]
    }
  },
  { 
    timestamps: true 
  }
);

// 🆕 INDEXES FOR PERFORMANCE
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'behavioralProfile.keystrokeSignatures.timestamp': -1 });
userSchema.index({ 'behavioralProfile.travelHistory.timestamp': -1 });
userSchema.index({ 'loginAttempts.lastFailedAttempt': -1 });
userSchema.index({ 'trustedFactors.trustedDevices.deviceId': 1 });

// 🆕 VIRTUAL FIELDS
userSchema.virtual('hasReliableBehavioralProfile').get(function() {
  return this.behavioralProfile?.mlModel?.isReliable || 
         this.behavioralProfile?.baselineProfile?.isReliable || 
         false;
});

userSchema.virtual('isAccountLocked').get(function() {
  return this.loginAttempts?.lockedUntil && 
         this.loginAttempts.lockedUntil > new Date();
});

userSchema.virtual('trainingProgress').get(function() {
  const sampleCount = this.behavioralProfile?.keystrokeSignatures?.length || 0;
  const minRequired = 5;
  const highConfidence = 15;
  
  if (sampleCount >= highConfidence) return 100;
  if (sampleCount >= minRequired) return 70 + (sampleCount - minRequired) * 3;
  return (sampleCount / minRequired) * 70;
});

// 🆕 METHODS

/**
 * Update baseline typing profile (Legacy - kept for compatibility)
 */
userSchema.methods.updateBaselineProfile = function() {
  const signatures = this.behavioralProfile?.keystrokeSignatures || [];
  
  if (signatures.length < 5) {
    if (this.behavioralProfile) {
      this.behavioralProfile.baselineProfile.isReliable = false;
      this.behavioralProfile.baselineProfile.confidence = signatures.length / 10;
    }
    return;
  }

  let totalDwell = 0;
  let totalFlight = 0;
  let dwellCount = 0;
  let flightCount = 0;
  
  const dwellValues = [];
  const flightValues = [];

  signatures.forEach(sig => {
    sig.dwellTimes?.forEach(d => {
      totalDwell += d.duration;
      dwellCount++;
      dwellValues.push(d.duration);
    });
    
    sig.flightTimes?.forEach(f => {
      totalFlight += f.duration;
      flightCount++;
      flightValues.push(f.duration);
    });
  });

  const avgDwell = dwellCount > 0 ? totalDwell / dwellCount : 0;
  const avgFlight = flightCount > 0 ? totalFlight / flightCount : 0;

  const dwellVariance = dwellValues.reduce((sum, val) => 
    sum + Math.pow(val - avgDwell, 2), 0) / dwellValues.length;
  const flightVariance = flightValues.reduce((sum, val) => 
    sum + Math.pow(val - avgFlight, 2), 0) / flightValues.length;

  if (!this.behavioralProfile) {
    this.behavioralProfile = {};
  }
  if (!this.behavioralProfile.baselineProfile) {
    this.behavioralProfile.baselineProfile = {};
  }

  this.behavioralProfile.baselineProfile = {
    avgDwellTime: avgDwell,
    avgFlightTime: avgFlight,
    stdDevDwell: Math.sqrt(dwellVariance),
    stdDevFlight: Math.sqrt(flightVariance),
    confidence: Math.min(signatures.length / 20, 1),
    lastUpdated: new Date(),
    sampleCount: signatures.length,
    isReliable: signatures.length >= 10
  };
};

/**
 * Get behavioral model training status
 */
userSchema.methods.getTrainingStatus = function() {
  const sampleCount = this.behavioralProfile?.keystrokeSignatures?.length || 0;
  const model = this.behavioralProfile?.mlModel;
  
  if (model && model.isReliable) {
    return {
      level: 'Trained',
      description: `Model trained with ${model.sampleSize} samples`,
      confidence: Math.round(model.confidence * 100),
      consistency: Math.round(model.consistencyScore * 100),
      progress: 100
    };
  } else if (sampleCount >= 5) {
    return {
      level: 'Learning',
      description: `Building baseline (${sampleCount} samples)`,
      confidence: Math.round(sampleCount * 5),
      progress: Math.min(90, 50 + sampleCount * 3)
    };
  } else {
    return {
      level: 'Initializing',
      description: `Need ${5 - sampleCount} more logins to establish baseline`,
      confidence: sampleCount * 10,
      progress: sampleCount * 20
    };
  }
};

/**
 * Add travel record and check for impossible travel
 */
userSchema.methods.addTravelRecord = function(fromLocation, toLocation, deviceId, loginId) {
  if (!fromLocation || !toLocation) return null;

  const distance = this.calculateDistance(
    fromLocation.latitude, fromLocation.longitude,
    toLocation.latitude, toLocation.longitude
  );

  const timeDiff = (new Date() - new Date(fromLocation.timestamp)) / (1000 * 60 * 60);
  const speed = timeDiff > 0 ? distance / timeDiff : 0;
  
  const MAX_REALISTIC_SPEED = 1000;
  const isImpossible = speed > MAX_REALISTIC_SPEED && distance > 100;

  const travelRecord = {
    fromLocation: {
      latitude: fromLocation.latitude,
      longitude: fromLocation.longitude,
      country: fromLocation.country,
      city: fromLocation.city,
      region: fromLocation.region,
      ip: fromLocation.ip
    },
    toLocation: {
      latitude: toLocation.latitude,
      longitude: toLocation.longitude,
      country: toLocation.country,
      city: toLocation.city,
      region: toLocation.region,
      ip: toLocation.ip
    },
    distance,
    timeDiff,
    travelSpeed: speed,
    timestamp: new Date(),
    flagged: isImpossible,
    flagReason: isImpossible ? 
      `Impossible travel: ${Math.round(distance)}km in ${Math.round(timeDiff)}h` : null,
    deviceId,
    loginId
  };

  if (!this.behavioralProfile) {
    this.behavioralProfile = {};
  }
  if (!this.behavioralProfile.travelHistory) {
    this.behavioralProfile.travelHistory = [];
  }

  this.behavioralProfile.travelHistory.push(travelRecord);

  if (this.behavioralProfile.travelHistory.length > 100) {
    this.behavioralProfile.travelHistory = 
      this.behavioralProfile.travelHistory.slice(-100);
  }

  return travelRecord;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
userSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

userSchema.methods.toRad = function(degrees) {
  return degrees * (Math.PI / 180);
};

/**
 * Update device trust score
 */
userSchema.methods.updateDeviceTrust = function(deviceId, loginSuccess) {
  if (!deviceId) return;

  if (!this.behavioralProfile) {
    this.behavioralProfile = {};
  }
  if (!this.behavioralProfile.deviceTrustScores) {
    this.behavioralProfile.deviceTrustScores = [];
  }

  const deviceIndex = this.behavioralProfile.deviceTrustScores
    .findIndex(d => d.deviceId === deviceId);

  if (deviceIndex === -1) {
    this.behavioralProfile.deviceTrustScores.push({
      deviceId,
      trustScore: loginSuccess ? 50 : 30,
      firstSeen: new Date(),
      lastSeen: new Date(),
      loginCount: 1,
      isTrusted: false
    });
  } else {
    const device = this.behavioralProfile.deviceTrustScores[deviceIndex];
    device.lastSeen = new Date();
    device.loginCount += 1;
    
    if (loginSuccess) {
      device.trustScore = Math.min(100, device.trustScore + 5);
    } else {
      device.trustScore = Math.max(0, device.trustScore - 10);
    }
    
    device.isTrusted = device.loginCount >= 5 && device.trustScore >= 70;
  }

  this.behavioralProfile.deviceTrustScores.sort((a, b) => 
    b.lastSeen - a.lastSeen
  );
  
  if (this.behavioralProfile.deviceTrustScores.length > 50) {
    this.behavioralProfile.deviceTrustScores = 
      this.behavioralProfile.deviceTrustScores.slice(0, 50);
  }
};

/**
 * Record login attempt
 */
userSchema.methods.recordLoginAttempt = function(success) {
  if (!this.loginAttempts) {
    this.loginAttempts = {};
  }

  if (success) {
    this.loginAttempts.failedAttempts = 0;
    this.loginAttempts.consecutiveFailures = 0;
    this.loginAttempts.totalSuccessfulLogins = 
      (this.loginAttempts.totalSuccessfulLogins || 0) + 1;
    this.loginAttempts.lastSuccessfulLogin = new Date();
    this.loginAttempts.lockedUntil = null;
  } else {
    this.loginAttempts.failedAttempts = 
      (this.loginAttempts.failedAttempts || 0) + 1;
    this.loginAttempts.consecutiveFailures = 
      (this.loginAttempts.consecutiveFailures || 0) + 1;
    this.loginAttempts.lastFailedAttempt = new Date();

    if (this.loginAttempts.consecutiveFailures >= 5) {
      const lockDuration = 15;
      this.loginAttempts.lockedUntil = new Date(Date.now() + lockDuration * 60000);
    }
  }
};

/**
 * Check if current login location is trusted
 */
userSchema.methods.isLocationTrusted = function(latitude, longitude) {
  if (!this.trustedFactors?.trustedLocations?.length) return false;

  return this.trustedFactors.trustedLocations.some(loc => {
    const distance = this.calculateDistance(
      latitude, longitude,
      loc.latitude, loc.longitude
    );
    return distance <= (loc.radius || 50);
  });
};

/**
 * Get comprehensive risk summary
 */
userSchema.methods.getRiskSummary = function() {
  const summary = {
    overallRisk: 'Low',
    riskFactors: [],
    recommendations: []
  };

  if (!this.hasReliableBehavioralProfile) {
    summary.riskFactors.push('Behavioral profile not yet established');
    summary.recommendations.push('Complete more logins to establish typing pattern');
  }

  const recentTravel = this.behavioralProfile?.travelHistory?.slice(-10) || [];
  const flaggedTravel = recentTravel.filter(t => t.flagged);
  
  if (flaggedTravel.length > 0) {
    summary.overallRisk = 'High';
    summary.riskFactors.push(`${flaggedTravel.length} impossible travel events detected`);
    summary.recommendations.push('Review travel history for potential account compromise');
  }

  const untrustedDevices = this.behavioralProfile?.deviceTrustScores
    ?.filter(d => !d.isTrusted) || [];
  
  if (untrustedDevices.length > 3) {
    summary.riskFactors.push('Multiple untrusted devices detected');
    summary.recommendations.push('Review and clean up trusted devices');
  }

  if (this.loginAttempts?.consecutiveFailures > 0) {
    summary.riskFactors.push(`${this.loginAttempts.consecutiveFailures} consecutive failed login attempts`);
  }

  return summary;
};

module.exports = mongoose.model("User", userSchema);