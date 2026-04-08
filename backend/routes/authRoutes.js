const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const SECRET = "SECRETKEY123";

/* ================= GET CLIENT IP ================= */
const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    "127.0.0.1"
  );
};

/* ================= GET DEVICE INFO ================= */
const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);

  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    device:
      device.vendor || device.model
        ? `${device.vendor || ""} ${device.model || ""}`
        : "Desktop",

    browser:
      browser.name && browser.version
        ? `${browser.name} ${browser.version}`
        : "Unknown",

    os:
      os.name && os.version
        ? `${os.name} ${os.version}`
        : "Unknown"
  };
};

/* ================= THREAT EXPLANATION ================= */
const generateThreatExplanation = (log, context = {}) => {
  let reasons = [];
  let recommendations = [];

  if (context.newIP) {
    reasons.push("Login from a new or unknown IP address");
    recommendations.push("Verify user identity");
  }

  if (context.lateNight) {
    reasons.push("Login attempt during unusual hours");
    recommendations.push("Check user activity pattern");
  }

  if (context.failedAttempts > 3) {
    reasons.push("Multiple failed login attempts detected");
    recommendations.push("Temporarily block IP address");
  }

  if (log.mlScore >= 0.7) {
    reasons.push("High anomaly score detected");
    recommendations.push("Enable 2FA");
  }

  if (reasons.length === 0) {
    reasons.push("Normal login behavior");
    recommendations.push("No action needed");
  }

  let riskLevel = "LOW";
  if (log.riskScore >= 70) riskLevel = "HIGH";
  else if (log.riskScore >= 40) riskLevel = "MEDIUM";

  return {
    title: "Threat Analysis Report",
    riskLevel,
    reasons,
    recommendations
  };
};

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    const cleanIP = getClientIP(req);
    const geo = geoip.lookup(cleanIP);
    const country = geo ? geo.country : "Unknown";

    const deviceInfo = getDeviceInfo(req);
    const io = req.app.get("io");

    /* ===== USER NOT FOUND ===== */
    if (!user) {
      const explanation = generateThreatExplanation(
        { riskScore: 60, mlScore: 0.6 },
        { newIP: true, failedAttempts: 5 }
      );

      const log = await LoginLog.create({
        email,
        role: "guest",
        ipAddress: cleanIP,
        country,
        ...deviceInfo,
        status: "failed",
        riskScore: 60,
        mlScore: 0.6,
        isAnomaly: true,
        isSimulated: false, // ✅ FIX
        threatExplanation: explanation
      });

      io.emit("attackDetected", log);

      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* ===== PASSWORD CHECK ===== */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const explanation = generateThreatExplanation(
        { riskScore: 60, mlScore: 0.6 },
        { failedAttempts: 5 }
      );

      const log = await LoginLog.create({
        userId: user._id,
        email: user.email,
        role: user.role,
        ipAddress: cleanIP,
        country,
        ...deviceInfo,
        status: "failed",
        riskScore: 60,
        mlScore: 0.6,
        isAnomaly: true,
        isSimulated: false, // ✅ FIX
        threatExplanation: explanation
      });

      io.emit("attackDetected", log);

      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* ===== SUCCESS LOGIN ===== */
    const previousLogins = await LoginLog.find({
      userId: user._id,
      status: "success"
    });

    const knownIPs = previousLogins.map(log => log.ipAddress);

    let riskScore = 10;
    let isAnomaly = false;
    let newIP = false;
    let lateNight = false;

    if (!knownIPs.includes(cleanIP) && previousLogins.length > 0) {
      riskScore += 30;
      isAnomaly = true;
      newIP = true;
    }

    const hour = new Date().getHours();
    if (hour < 6) {
      riskScore += 20;
      isAnomaly = true;
      lateNight = true;
    }

    const failedAttempts = await LoginLog.countDocuments({
      ipAddress: cleanIP,
      status: "failed",
      createdAt: {
        $gte: new Date(Date.now() - 10 * 60 * 1000)
      }
    });

    if (failedAttempts > 3) {
      riskScore += 20;
      isAnomaly = true;
    }

    const explanation = generateThreatExplanation(
      { riskScore, mlScore: 0.2 },
      { newIP, lateNight, failedAttempts }
    );

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: cleanIP,
      country,
      ...deviceInfo,
      status: "success",
      riskScore,
      mlScore: 0.2,
      isAnomaly,
      isSimulated: false, // ✅ FIX
      threatExplanation: explanation
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= 🚨 ATTACK SIMULATION ================= */
router.post("/simulate-attack", async (req, res) => {
  try {
    const { type } = req.body;

    let fakeLogs = [];

    if (type === "brute_force") {
      for (let i = 0; i < 20; i++) {
        fakeLogs.push({
          email: "admin@gmail.com",
          role: "attacker",
          ipAddress: `192.168.1.${i % 3}`,
          country: "Unknown",
          device: "Bot",
          browser: "Script",
          os: "Unknown",
          status: "failed",
          riskScore: 80,
          mlScore: 0.9,
          isAnomaly: true,
          isSimulated: true, // ✅ FIX
          threatExplanation: generateThreatExplanation(
            { riskScore: 80, mlScore: 0.9 },
            { failedAttempts: 10, newIP: true }
          )
        });
      }
    }

    if (type === "credential_stuffing") {
      for (let i = 0; i < 30; i++) {
        fakeLogs.push({
          email: `user${i % 5}@gmail.com`,
          role: "attacker",
          ipAddress: `10.0.0.${i}`,
          country: "Multiple",
          device: "Bot",
          browser: "Script",
          os: "Unknown",
          status: "failed",
          riskScore: 85,
          mlScore: 0.95,
          isAnomaly: true,
          isSimulated: true, // ✅ FIX
          threatExplanation: generateThreatExplanation(
            { riskScore: 85, mlScore: 0.95 },
            { failedAttempts: 8, newIP: true }
          )
        });
      }
    }

    if (type === "normal_traffic") {
      for (let i = 0; i < 10; i++) {
        fakeLogs.push({
          email: `user${i}@gmail.com`,
          role: "user",
          ipAddress: `223.178.83.${i}`,
          country: "IN",
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          status: "success",
          riskScore: 10,
          mlScore: 0.1,
          isAnomaly: false,
          isSimulated: true, // ✅ FIX
          threatExplanation: generateThreatExplanation(
            { riskScore: 10, mlScore: 0.1 },
            {}
          )
        });
      }
    }

    const insertedLogs = await LoginLog.insertMany(fakeLogs);

    const io = req.app.get("io");
    io.emit("attackDetected", insertedLogs);

    res.json({
      message: "Attack simulated successfully",
      type,
      count: insertedLogs.length
    });

  } catch (error) {
    console.error("SIMULATION ERROR:", error);
    res.status(500).json({ message: "Simulation failed" });
  }
});

/* ================= 📊 GET ALL LOGS ================= */
router.get("/logs", async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    console.log("✅ Logs fetched:", logs.length);

    res.json(logs);
  } catch (error) {
    console.error("❌ FETCH LOGS ERROR:", error);
    res.status(500).json({ message: "Error fetching logs" });
  }
});

module.exports = router;