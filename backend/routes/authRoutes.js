const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const nodemailer = require("nodemailer");
const passport = require("passport");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const SECRET = process.env.JWT_SECRET;

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`
  });
};

/* ================= HELPERS ================= */
const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
};

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"] || "");
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    device:
      device.vendor || device.model
        ? `${device.vendor || ""} ${device.model || ""}`
        : "Desktop",
    browser: browser.name
      ? `${browser.name} ${browser.version}`
      : "Unknown",
    os: os.name ? `${os.name} ${os.version}` : "Unknown"
  };
};

/* ================= REGISTER (SEND OTP) ================= */
/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let user = await User.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      user = new User({
        name,
        email,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
        isVerified: false
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
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "OTP verified" });

  } catch {
    res.status(500).json({ message: "Verification failed" });
  }
});
/* ================= SET PASSWORD ================= */
router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Verify email first" });
    }

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: "Account created successfully" });

  } catch {
    res.status(500).json({ message: "Error setting password" });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;

  await user.save();
  await sendOTP(email, otp);

  res.json({ message: "OTP sent to email" });
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "Password reset successful" });
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";
    const deviceInfo = getDeviceInfo(req);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      country,
      ...deviceInfo,
      status: "success",
      riskScore: 10,
      isAnomaly: false
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

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GOOGLE AUTH ================= */
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;