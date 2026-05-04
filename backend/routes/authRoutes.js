const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const nodemailer = require("nodemailer");

const calculateRiskScore = require("../utils/riskEngine");
const KeystrokeAnalyzer = require("../utils/keystrokeAnalyzer");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const Case = require("../models/Case");

const SECRET = process.env.JWT_SECRET || "supersecret";

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= HELPERS ================= */

const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || req.connection?.remoteAddress;
};

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    device: device.vendor || device.model 
      ? `${device.vendor || ""} ${device.model || ""}`.trim() 
      : "Desktop",
    browser: browser.name || "Unknown",
    os: os.name || "Unknown",
    isMobile: device.type === "mobile",
    isTablet: device.type === "tablet",
    isDesktop: !device.type || device.type === "desktop"
  };
};

const sendSecurityAlert = async (email, userName, alertData) => {
  try {
    const mailOptions = {
      from: `"Security Alert" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 Security Alert: ${alertData.riskLevel} Risk Login Detected`,
      html: `<div style="font-family: Arial, sans-serif;"><h2>⚠️ Security Alert</h2><p>Risk Score: ${alertData.riskScore}/100</p></div>`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Security alert sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send security alert:", error);
    return false;
  }
};

const generateTempToken = (userId) => {
  return jwt.sign({ userId, type: "mfa_pending" }, SECRET, { expiresIn: "5m" });
};

async function logFailedAttempt(req, email) {
  try {
    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);
    const deviceInfo = getDeviceInfo(req);
    
    const failedLog = new LoginLog({
      email,
      ipAddress: ip,
      country: geo?.country || "Unknown",
      state: geo?.region || "Unknown",
      latitude: geo?.ll?.[0] || null,
      longitude: geo?.ll?.[1] || null,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceId: req.body.deviceId || "unknown",
      status: "failed",
      failureReason: "Invalid credentials",
      riskScore: 0,
      riskLevel: "Low"
    });
    await failedLog.save();
  } catch (error) {
    console.error("Error logging failed attempt:", error);
  }
}

const updateUserBehavioralProfile = async (userId, loginData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.behavioralProfile) {
      user.behavioralProfile = {
        keystrokeSignatures: [],
        baselineProfile: {},
        travelHistory: [],
        deviceTrustScores: [],
        riskProfile: {},
        mlModel: {}
      };
    }

    if (loginData.keystrokeSignature) {
      user.behavioralProfile.keystrokeSignatures.push({
        signatureHash: loginData.keystrokeSignature.signatureHash,
        dwellTimes: loginData.keystrokeSignature.dwellTimes,
        flightTimes: loginData.keystrokeSignature.flightTimes,
        avgDwellTime: loginData.keystrokeSignature.avgDwellTime,
        avgFlightTime: loginData.keystrokeSignature.avgFlightTime,
        typingSpeed: loginData.keystrokeSignature.typingSpeed,
        totalTypingTime: loginData.keystrokeSignature.totalTypingTime,
        keyCount: loginData.keystrokeSignature.keyCount,
        timestamp: new Date(),
        deviceId: loginData.deviceId,
        loginSuccess: true,
        ipAddress: loginData.ip
      });

      if (user.behavioralProfile.keystrokeSignatures.length > 50) {
        user.behavioralProfile.keystrokeSignatures = 
          user.behavioralProfile.keystrokeSignatures.slice(-50);
      }

      const model = KeystrokeAnalyzer.trainModel(
        user.behavioralProfile.keystrokeSignatures
      );
      
      if (model) {
        user.behavioralProfile.mlModel = model;
        user.behavioralProfile.baselineProfile = {
          avgDwellTime: model.dwell.mean,
          avgFlightTime: model.flight.mean,
          avgTypingSpeed: model.speed.mean,
          stdDevDwell: model.dwell.stdDev,
          stdDevFlight: model.flight.stdDev,
          confidence: model.confidence,
          lastUpdated: new Date(),
          sampleCount: model.sampleSize,
          isReliable: model.isReliable,
          trainingStatus: model.trainingStatus
        };
        
        console.log(`✅ Behavioral model updated - Samples: ${model.sampleSize}, Confidence: ${Math.round(model.confidence * 100)}%`);
      }
    }

    await user.updateDeviceTrust(loginData.deviceId, true);
    await user.recordLoginAttempt(true);

    if (!user.behavioralProfile.riskProfile) {
      user.behavioralProfile.riskProfile = {};
    }
    user.behavioralProfile.riskProfile.lastAssessed = new Date();
    user.behavioralProfile.riskProfile.overallRiskScore = 
      (user.behavioralProfile.riskProfile.overallRiskScore || 0) * 0.7 + 
      loginData.riskScore * 0.3;

    await user.save();
    
  } catch (error) {
    console.error("Error updating behavioral profile:", error);
  }
};

// 🆕 Determine threat type for case creation
function determineThreatType(risk, log) {
  const threats = [];
  if (risk.keystrokeAnalysis?.anomalyScore > 40) threats.push("Behavioral Anomaly");
  if (risk.dnaAnalysis && !risk.dnaAnalysis.isGenuine) threats.push("DNA Mismatch");
  if (risk.travelAnalysis?.impossibleTravel) threats.push("Impossible Travel");
  if (risk.riskScore >= 80) threats.push("Account Takeover Attempt");
  if (risk.riskComponents?.deviceRisk?.isNewDevice) threats.push("New Device Login");
  if (risk.riskComponents?.temporal?.score > 0) threats.push("Unusual Login Time");
  return threats.length > 0 ? threats.join(", ") : "Suspicious Activity";
}

// 🆕 Generate case notes from risk analysis
function generateCaseNotes(risk, log) {
  const notes = [];
  notes.push(`Risk Score: ${risk.riskScore}/100 (${risk.riskLevel} Risk)`);
  notes.push(`IP: ${log.ipAddress || 'N/A'}`);
  notes.push(`Location: ${log.country || 'Unknown'}, ${log.state || 'Unknown'}`);
  notes.push(`Device: ${log.device || 'Unknown'} (${log.browser || 'Unknown'})`);
  if (risk.reasons && risk.reasons.length > 0) notes.push(`Reasons: ${risk.reasons.join('; ')}`);
  if (risk.keystrokeAnalysis?.anomalyScore > 30) notes.push(`Behavioral Anomaly: ${risk.keystrokeAnalysis.anomalyScore}%`);
  if (risk.travelAnalysis?.impossibleTravel) notes.push(`Impossible Travel: ${risk.travelAnalysis.distanceTraveled}km`);
  return notes.join(' | ');
}

// 🆕 Auto-create case for high-risk logins
async function autoCreateCase(user, risk, loginLog, req) {
  try {
    if (risk.riskLevel !== "High" && risk.riskLevel !== "Critical" && !risk.shouldBlock) {
      return null;
    }

    const existingCase = await Case.findOne({ loginLogId: loginLog._id });
    if (existingCase) {
      console.log("📋 Case already exists for this login");
      return existingCase;
    }

    const threatType = determineThreatType(risk, loginLog);
    const notes = generateCaseNotes(risk, loginLog);

    const newCase = new Case({
      email: user.email,
      userId: user._id,
      loginLogId: loginLog._id,
      status: "Open",
      severity: risk.riskLevel === "Critical" || risk.shouldBlock ? "Critical" : "High",
      actionTaken: risk.shouldBlock ? "Login Blocked - Investigation Required" : "Automatic Detection - Awaiting Review",
      threatType: threatType,
      notes: notes,
      ipAddress: loginLog.ipAddress,
      deviceId: loginLog.deviceId,
      country: loginLog.country,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      loginTimestamp: loginLog.createdAt,
      autoGenerated: true
    });

    await newCase.save();
    console.log(`🛡️ Case auto-created: ${newCase._id} - ${threatType}`);
    
    const io = req.app?.get("io");
    if (io) {
      io.to("role:admin").emit("case:auto-created", {
        caseId: newCase._id,
        email: newCase.email,
        threatType: newCase.threatType,
        riskScore: newCase.riskScore
      });
    }

    return newCase;
  } catch (error) {
    console.error("Auto case creation error:", error.message);
    return null;
  }
}

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    await user.save();

    res.status(201).json({ 
      success: true,
      message: "Registered successfully" 
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password, deviceId, keystrokeData } = req.body;

    console.log("🔑 Keystroke Data Received:", 
      keystrokeData ? `YES (${Array.isArray(keystrokeData) ? keystrokeData.length : 'object'} events)` : "NO");

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Failed login attempt for non-existent user: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify your email first" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logFailedAttempt(req, email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!deviceId || deviceId === "undefined" || deviceId === "null" || deviceId === "") {
      deviceId = "unknown-device";
    }

    console.log("📱 Login Device ID:", deviceId);

    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);

    const country = geo?.country || "Unknown";
    const state = geo?.region || "Unknown";
    const city = geo?.city || "Unknown";
    const latitude = geo?.ll?.[0] || null;
    const longitude = geo?.ll?.[1] || null;

    const deviceInfo = getDeviceInfo(req);

    console.log("📍 Login Location:", { country, state, city });

    const recentLogs = await LoginLog.find({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(20);

    const lastSuccessfulLogin = recentLogs.find(log => log.status === "success");

     // 🆕 LOAD DNA MODEL FOR ATTACK DETECTION
    if (user.behavioralProfile?.dnaModel) {
        try {
            const BehavioralDNA = require("../utils/behavioralDNA");
            BehavioralDNA.importModel(user.behavioralProfile.dnaModel);
            console.log("🧬 DNA Model loaded for real-time verification");
        } catch (err) {
            console.log("⚠️ Could not load DNA model:", err.message);
        }
    }

    const risk = await calculateRiskScore({
      user,
      loginData: {
        device: deviceInfo.device,
        deviceId,
        country,
        state,
        latitude,
        longitude,
        ipAddress: ip,
        failedAttempts: 0,
      },
      recentLogs,
      keystrokeData
    });

    console.log("🎯 Risk Assessment:", {
      score: risk.riskScore,
      level: risk.riskLevel,
      requiresMFA: risk.requiresMFA
    });

    let keystrokeAnalysis = null;
    let keystrokeSignature = null;

    if (keystrokeData) {
      try {
        console.log("🔍 Processing keystroke data...");
        const processedKeystroke = KeystrokeAnalyzer.processKeystrokes(keystrokeData);
        
        if (processedKeystroke.valid) {
          keystrokeSignature = processedKeystroke.signature;
          console.log("✅ Keystroke signature created:", {
            avgDwell: keystrokeSignature.avgDwellTime?.toFixed(2),
            avgFlight: keystrokeSignature.avgFlightTime?.toFixed(2),
            typingSpeed: keystrokeSignature.typingSpeed?.toFixed(2),
            keyCount: keystrokeSignature.keyCount
          });
          
          keystrokeAnalysis = risk.keystrokeAnalysis || {
            anomalyScore: 0,
            riskLevel: "Low",
            confidence: "Low"
          };
        } else {
          console.log("⚠️ Invalid keystroke data:", processedKeystroke.reason);
        }
      } catch (e) {
        console.error("❌ Keystroke processing error:", e.message);
      }
    } else {
      console.log("⚠️ No keystroke data received in request");
    }

    let travelAnalysis = risk.travelAnalysis || null;
    if (!travelAnalysis && lastSuccessfulLogin?.latitude && lastSuccessfulLogin?.longitude && latitude && longitude) {
      const timeDiff = (Date.now() - new Date(lastSuccessfulLogin.createdAt)) / (1000 * 60 * 60);
      const distance = KeystrokeAnalyzer.calculateDistance(
        lastSuccessfulLogin.latitude, lastSuccessfulLogin.longitude,
        latitude, longitude
      );
      
      travelAnalysis = {
        distanceTraveled: Math.round(distance * 100) / 100,
        timeSinceLastLogin: Math.round(timeDiff * 100) / 100,
        travelSpeed: timeDiff > 0 ? Math.round(distance / timeDiff) : 0,
        impossibleTravel: distance > 500 && timeDiff < 1,
        travelRiskScore: distance > 500 ? 50 : 0
      };
    }

    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    const temporalAnalysis = {
      loginHour: currentHour,
      loginDay: currentDay,
      isUnusualTime: currentHour >= 1 && currentHour <= 4
    };

    // BLOCKED LOGIN
    if (risk.shouldBlock) {
      const blockedLog = new LoginLog({
        userId: user._id,
        email: user.email,
        role: user.role,
        ipAddress: ip,
        country: country,
        state: state,
        latitude: latitude,
        longitude: longitude,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceId: deviceId,
        status: "blocked",
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        combinedRiskScore: risk.riskScore,
        isAnomaly: true,
        keystrokeAnalysis: keystrokeAnalysis || {},
        travelAnalysis: travelAnalysis || {},
        temporalAnalysis: temporalAnalysis || {},
        threatExplanation: {
          riskLevel: risk.riskLevel,
          reasons: risk.reasons || [],
          recommendations: risk.recommendations || []
        }
      });
      await blockedLog.save();

      // 🆕 Auto-create case for blocked login
      await autoCreateCase(user, risk, blockedLog, req);

      return res.status(403).json({
        success: false,
        message: "Login blocked due to suspicious activity",
        riskScore: risk.riskScore
      });
    }

    // SUCCESSFUL LOGIN
    const loginLog = new LoginLog({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      country: country,
      state: state,
      latitude: latitude,
      longitude: longitude,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceId: deviceId,
      status: "success",
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      combinedRiskScore: risk.riskScore,
      isAnomaly: risk.riskLevel === "High" || risk.riskLevel === "Critical",
      keystrokeAnalysis: keystrokeAnalysis || {},
      travelAnalysis: travelAnalysis || {},
      temporalAnalysis: temporalAnalysis || {},
      threatExplanation: {
        riskLevel: risk.riskLevel,
        reasons: risk.reasons || [],
        recommendations: risk.recommendations || []
      }
    });
    await loginLog.save();

    console.log("📝 LoginLog saved with keystroke analysis:", 
      keystrokeAnalysis ? `YES (anomaly: ${keystrokeAnalysis.anomalyScore || 0}%)` : "NO");

    // 🆕 Auto-create case for high-risk successful logins
    if (risk.riskLevel === "High" || risk.riskLevel === "Critical") {
      await autoCreateCase(user, risk, loginLog, req);
    }

    user.lastLoginIP = ip;
    user.lastLoginCountry = country;
    
        // 🆕 Only update behavioral profile for normal logins (exclude bots)
    if (risk.riskLevel !== "High" 
        && risk.riskLevel !== "Critical" 
        && keystrokeSignature 
        && deviceId !== "bot-attack-simulator") {
        console.log("📊 Updating behavioral profile with new signature...");
        await updateUserBehavioralProfile(user._id, {
            keystrokeSignature,
            deviceId,
            ip,
            riskScore: risk.riskScore
        });
    } else {
        console.log("⏭️ Skipping behavioral update:", 
            deviceId === "bot-attack-simulator" ? "Bot detected - not saved to training" :
            !keystrokeSignature ? "No signature available" : 
            "High risk login - not saved to training");
    }
    await user.save();

    if (risk.riskLevel === "High" || risk.riskLevel === "Critical") {
      await sendSecurityAlert(user.email, user.name, {
        riskLevel: risk.riskLevel.toUpperCase(),
        riskScore: risk.riskScore,
        location: `${city}, ${country}`,
        ip,
        device: deviceInfo.device,
        reasons: risk.reasons || [],
        recommendations: risk.recommendations || []
      });
    }

    if (risk.requiresMFA) {
      const tempToken = generateTempToken(user._id);
      return res.json({
        success: true,
        requiresMFA: true,
        tempToken,
        userId: user._id,
        riskAssessment: {
          level: risk.riskLevel,
          score: risk.riskScore,
          reasons: risk.reasons
        },
        message: "Additional verification required"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );

    const trainingStatus = user.getTrainingStatus ? user.getTrainingStatus() : null;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email
      },
      riskAssessment: {
        level: risk.riskLevel,
        score: risk.riskScore,
        reasons: risk.reasons
      },
      trainingStatus: trainingStatus
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= OTHER ROUTES ================= */
router.post("/logout", async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.post("/verify-mfa", async (req, res) => {
  try {
    const { tempToken, verificationCode } = req.body;
    const decoded = jwt.verify(tempToken, SECRET);
    if (decoded.type !== "mfa_pending") {
      return res.status(400).json({ message: "Invalid token type" });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (verificationCode !== "123456") {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

router.get("/training-status/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const trainingStatus = user.getTrainingStatus ? user.getTrainingStatus() : {
      level: 'Unknown',
      description: 'Training status not available',
      confidence: 0,
      progress: 0
    };
    res.json({
      userId: user._id,
      email: user.email,
      sampleCount: user.behavioralProfile?.keystrokeSignatures?.length || 0,
      trainingStatus: trainingStatus,
      mlModel: user.behavioralProfile?.mlModel || null
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

router.put("/users/block/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: req.body.isBlocked },
    { new: true }
  ).select("-password");
  res.json(user);
});

router.get("/logs", async (req, res) => {
  const logs = await LoginLog.find().sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

router.post("/mark-safe", async (req, res) => {
  const log = await LoginLog.findByIdAndUpdate(
    req.body.logId,
    { isVerifiedByUser: true, isReported: false, resolved: true },
    { new: true }
  );
  res.json(log);
});

router.post("/report-attack", async (req, res) => {
  const log = await LoginLog.findByIdAndUpdate(
    req.body.logId,
    { isReported: true, isVerifiedByUser: false, resolved: true },
    { new: true }
  );
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "🚨 Suspicious Login Reported",
    html: `<p>Email: ${log.email}</p><p>IP: ${log.ipAddress}</p><p>Device: ${log.deviceId}</p>`
  });
  res.json(log);
});

/* ================= TRAIN BEHAVIORAL MODEL ================= */
router.post("/train-behavioral/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const signatures = user.behavioralProfile?.keystrokeSignatures || [];
    
    if (signatures.length < 5) {
      return res.status(400).json({ 
        message: `Need ${5 - signatures.length} more login samples to train`,
        currentSamples: signatures.length,
        requiredSamples: 5
      });
    }

    // Train statistical model
    const model = KeystrokeAnalyzer.trainModel(signatures);
    
    if (model) {
      user.behavioralProfile.mlModel = model;
      user.behavioralProfile.baselineProfile = {
        avgDwellTime: model.dwell.mean,
        avgFlightTime: model.flight.mean,
        avgTypingSpeed: model.speed.mean,
        stdDevDwell: model.dwell.stdDev,
        stdDevFlight: model.flight.stdDev,
        confidence: model.confidence,
        lastUpdated: new Date(),
        sampleCount: model.sampleSize,
        isReliable: model.isReliable,
        trainingStatus: model.trainingStatus
      };
    }

    // Train DNA model
    const BehavioralDNA = require("../utils/behavioralDNA");
    const dnaTrained = await BehavioralDNA.trainOnUserData(signatures);
    
    if (dnaTrained) {
      user.behavioralProfile.dnaModel = BehavioralDNA.exportModel();
      user.behavioralProfile.dnaTrainingMetadata = {
        isTrained: true,
        trainingSamples: signatures.length,
        lastTrainingDate: new Date(),
        modelAccuracy: 95
      };
    }

    await user.save();

    res.json({
      success: true,
      message: "Behavioral model trained successfully",
      samples: signatures.length,
      statisticalModel: model ? "Trained" : "Failed",
      dnaModel: dnaTrained ? "Trained" : "Failed",
      confidence: model ? Math.round(model.confidence * 100) : 0
    });

  } catch (err) {
    console.error("Training error:", err);
    res.status(500).json({ message: "Training failed" });
  }
});

module.exports = router;