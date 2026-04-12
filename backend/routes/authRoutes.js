const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const SECRET = process.env.JWT_SECRET;

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
/* ================= SIMPLE REGISTER ===================== */
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
      isVerified: true, // ✅ skip OTP
    });

    await user.save();

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ================= SEND OTP ============================ */
/* ===================================================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    let user = await User.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      user = new User({
        name,
        email,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
        isVerified: false,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;
    }

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    console.log("✅ OTP SENT:", email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ===================================================== */
/* ================= VERIFY OTP ========================== */
/* ===================================================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
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

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";
    const deviceInfo = getDeviceInfo(req);

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      country,
      ...deviceInfo,
      status: "success",
      riskScore: 10,
      isAnomaly: false,
      isSimulated: false,
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
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
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
    console.error("LOG ERROR:", err);
    res.status(500).json({ message: "Error fetching logs" });
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
    console.error("USER ERROR:", err);
    res.status(500).json({ message: "Error fetching users" });
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
        device: "Bot",
        browser: "Script",
        os: "Unknown",
        status: "failed",
        riskScore: 80,
        isAnomaly: true,
        isSimulated: true,
      });
    }

    await LoginLog.insertMany(fakeLogs);

    res.json({ message: "Attack simulated" });
  } catch (err) {
    console.error("SIM ERROR:", err);
    res.status(500).json({ message: "Simulation failed" });
  }
});

module.exports = router;