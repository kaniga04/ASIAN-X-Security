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

    // New IP detection
    if (!knownIPs.includes(cleanIP) && previousLogins.length > 0) {
      riskScore += 30;
      isAnomaly = true;
      newIP = true;
    }

    // Time-based anomaly
    const hour = new Date().getHours();
    if (hour < 6) {
      riskScore += 20;
      isAnomaly = true;
      lateNight = true;
    }

    // Failed attempts tracking (last 10 mins)
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

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "Registered successfully"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

/* ================= GET LOGS ================= */
router.get("/logs", async (req, res) => {
  const logs = await LoginLog.find().sort({ createdAt: -1 });
  res.json(logs);
});

/* ================= GET USERS ================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

/* ================= DASHBOARD STATS ================= */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLogins = await LoginLog.countDocuments();
    const failedLogins = await LoginLog.countDocuments({ status: "failed" });
    const anomalies = await LoginLog.countDocuments({ isAnomaly: true });

    res.json({
      totalUsers,
      totalLogins,
      failedLogins,
      anomalies
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;