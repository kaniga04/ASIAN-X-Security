const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const SECRET = "SECRETKEY123";

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= OTP STORE ================= */
const otpStore = new Map();

/* ================= VALIDATION ================= */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

/* ================= GET CLIENT IP ================= */
const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
};

/* ================= DEVICE INFO ================= */
const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"] || "");

  return {
    device: parser.getDevice().model || "Desktop",
    browser: parser.getBrowser().name || "Unknown",
    os: parser.getOS().name || "Unknown"
  };
};

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP failed" });
  }
});

/* ================= VERIFY OTP + REGISTER ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const record = otpStore.get(email);

    if (!record)
      return res.status(400).json({ message: "OTP not found" });

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (!isStrongPassword(password))
      return res.status(400).json({
        message: "Weak password"
      });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "user"
    });

    await user.save();
    otpStore.delete(email);

    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role 
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

/* ================= GET LOGS ================= */
router.get("/logs", async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);

  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

module.exports = router;