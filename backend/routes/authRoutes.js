const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your gmail
    pass: process.env.EMAIL_PASS    // app password (NOT real password)
  }
});

/* ================= TEMP OTP STORE ================= */
const otpStore = new Map();

/* ================= VALIDATION ================= */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
};

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 min
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("OTP ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP + REGISTER ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // password validation
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars, include uppercase, lowercase, number, special char"
      });
    }

    // create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user"
    });

    await newUser.save();

    otpStore.delete(email);

    res.status(201).json({
      message: "Account created successfully"
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;