const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const nodemailer = require("nodemailer");

const calculateRiskScore = require("../utils/riskEngine");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

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
  if (forwarded) return forwarded.split(",")[0];
  return req.socket?.remoteAddress || req.ip;
};

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    device:
      device.vendor || device.model
        ? `${device.vendor || ""} ${device.model || ""}`
        : "Desktop",
    browser: browser.name || "Unknown",
    os: os.name || "Unknown",
  };
};

/* ===================================================== */
/* ================= REGISTER ============================ */
/* ===================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
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
      isVerified: true,
    });

    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ================= LOGIN =============================== */
/* ===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* GEO + DEVICE */
    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);

    const country = geo?.country || "Unknown";
    const state = geo?.region || "Unknown";

    const latitude = geo?.ll?.[0] || null;
    const longitude = geo?.ll?.[1] || null;

    const deviceInfo = getDeviceInfo(req);

    /* RECENT LOGS */
    const recentLogs = await LoginLog.find({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(20);

    /* RISK */
    const risk = await calculateRiskScore({
      user,
      loginData: {
        device: deviceInfo.device,
        state,
        latitude,
        longitude,
        failedAttempts: 0,
      },
      recentLogs,
    });

    /* SAVE LOG */
    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      country,
      state,
      latitude,
      longitude,
      ...deviceInfo,
      status: "success",

      riskScore: risk.riskScore,
      isAnomaly: risk.riskLevel !== "Normal",

      isVerifiedByUser: false,
      isReported: false,

      threatExplanation: {
        riskLevel: risk.riskLevel,
        reasons: risk.reasons,
      },
    });

    /* TOKEN */
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
        role: user.role,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ================= GET USERS =========================== */
/* ===================================================== */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

/* ===================================================== */
/* ================= DELETE USER ========================= */
/* ===================================================== */
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ===================================================== */
/* ================= BLOCK USER ========================== */
/* ===================================================== */
router.put("/users/block/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    );

    res.json({ message: "User updated", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ===================================================== */
/* ================= GET LOGS ============================ */
/* ===================================================== */
router.get("/logs", async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

/* ===================================================== */
/* ================= MARK SAFE =========================== */
/* ===================================================== */
router.post("/mark-safe", async (req, res) => {
  try {
    const { logId } = req.body;

    const log = await LoginLog.findByIdAndUpdate(
      logId,
      { isVerifiedByUser: true, isReported: false },
      { new: true }
    );

    res.json({ message: "Marked as safe", log });

  } catch (err) {
    res.status(500).json({ message: "Error marking safe" });
  }
});

/* ===================================================== */
/* ================= REPORT ATTACK ======================= */
/* ===================================================== */
router.post("/report-attack", async (req, res) => {
  try {
    const { logId } = req.body;

    const log = await LoginLog.findByIdAndUpdate(
      logId,
      { isReported: true, isVerifiedByUser: false },
      { new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🚨 Suspicious Login Reported",
      html: `
        <h3>Alert!</h3>
        <p>User reported suspicious login</p>
        <p>Email: ${log.email}</p>
        <p>IP: ${log.ipAddress}</p>
        <p>Location: ${log.country}</p>
      `,
    });

    res.json({ message: "Reported successfully", log });

  } catch (err) {
    res.status(500).json({ message: "Error reporting attack" });
  }
});

/* ===================================================== */
/* ================= SIMULATE ATTACK ===================== */
/* ===================================================== */
router.post("/simulate-attack", async (req, res) => {
  try {
    const fakeLogs = [];

    for (let i = 0; i < 10; i++) {
      fakeLogs.push({
        email: `attacker${i}@gmail.com`,
        role: "attacker",
        ipAddress: `192.168.1.${i}`,
        country: "Unknown",
        state: "Unknown",
        latitude: null,
        longitude: null,
        device: "Bot",
        browser: "Script",
        os: "Unknown",
        status: "failed",
        riskScore: 80,
        isAnomaly: true,
        isVerifiedByUser: false,
        isReported: false,
      });
    }

    await LoginLog.insertMany(fakeLogs);

    res.json({ message: "Attack simulated" });

  } catch (err) {
    res.status(500).json({ message: "Simulation failed" });
  }
});

/* ===================================================== */
/* ================= UPDATE PROFILE ====================== */
/* ===================================================== */
router.put("/update-profile", async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.department = department || user.department;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;