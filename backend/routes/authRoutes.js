const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");

const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const SECRET = "SECRETKEY123";


// ================= ML RISK SCORING =================
function calculateMLScore(failedAttempts, newIP, lateNight) {

  let score = 0;

  score += failedAttempts * 0.25;

  if (newIP) score += 0.35;

  if (lateNight) score += 0.2;

  return Math.min(score, 1);
}


// ================= MITRE MAPPING =================
function getMitreMapping(type) {

  const mitreMap = {

    brute_force: {
      tactic: "Credential Access",
      technique: "Brute Force",
      techniqueId: "T1110",
      reason: "Multiple failed login attempts detected from the same source."
    },

    new_ip: {
      tactic: "Initial Access",
      technique: "Valid Accounts",
      techniqueId: "T1078",
      reason: "Login from an unknown IP address not previously associated with this account."
    },

    late_night: {
      tactic: "Defense Evasion",
      technique: "Unusual Login Time",
      techniqueId: "T1036",
      reason: "Login attempt detected during unusual hours."
    }

  };

  return mitreMap[type] || null;
}



// ================= REGISTER =================
router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

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

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});



// ================= LOGIN =================
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const geo = geoip.lookup(ipAddress);
    const country = geo ? geo.country : "Unknown";


    // ================= USER NOT FOUND =================
    if (!user) {

      const mitre = getMitreMapping("brute_force");

      await LoginLog.create({

        email,
        role: "guest",

        ipAddress,
        country,

        status: "failed",

        riskScore: 40,
        mlScore: 0.5,

        isAnomaly: true,

        mitreTactic: mitre.tactic,
        mitreTechnique: mitre.technique,
        mitreTechniqueId: mitre.techniqueId,
        anomalyReason: mitre.reason

      });

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }


    // ================= PASSWORD CHECK =================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      const mitre = getMitreMapping("brute_force");

      await LoginLog.create({

        userId: user._id,
        email: user.email,
        role: user.role,

        ipAddress,
        country,

        status: "failed",

        riskScore: 40,
        mlScore: 0.5,

        isAnomaly: true,

        mitreTactic: mitre.tactic,
        mitreTechnique: mitre.technique,
        mitreTechniqueId: mitre.techniqueId,
        anomalyReason: mitre.reason

      });

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }


    // ================= LOGIN SUCCESS =================

    const previousLogins = await LoginLog.find({
      userId: user._id,
      status: "success"
    });

    const knownIPs = previousLogins.map(log => log.ipAddress);

    let riskScore = 10;
    let newIP = false;
    let lateNight = false;
    let isAnomaly = false;

    let mitre = null;


    // ---------- NEW IP DETECTION ----------
    if (!knownIPs.includes(ipAddress) && previousLogins.length > 0) {

      riskScore += 30;
      newIP = true;
      isAnomaly = true;

      mitre = getMitreMapping("new_ip");

    }


    // ---------- LATE NIGHT LOGIN ----------
    const hour = new Date().getHours();

    if (hour < 6) {

      riskScore += 20;

      lateNight = true;
      isAnomaly = true;

      mitre = getMitreMapping("late_night");

    }


    // ---------- FAILED ATTEMPTS ----------
    const failedAttempts = await LoginLog.countDocuments({

      ipAddress,
      status: "failed",

      createdAt: {
        $gte: new Date(Date.now() - 10 * 60 * 1000)
      }

    });


    // ---------- ML SCORE ----------
    const mlScore = calculateMLScore(
      failedAttempts,
      newIP,
      lateNight
    );


    // ================= SAVE LOGIN LOG =================
    await LoginLog.create({

      userId: user._id,
      email: user.email,
      role: user.role,

      ipAddress,
      country,

      status: "success",

      riskScore,
      mlScore,

      isAnomaly,

      mitreTactic: mitre ? mitre.tactic : null,
      mitreTechnique: mitre ? mitre.technique : null,
      mitreTechniqueId: mitre ? mitre.techniqueId : null,
      anomalyReason: mitre ? mitre.reason : null

    });


    // ================= JWT TOKEN =================
    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

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

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});



// ================= LOGOUT =================
router.post("/logout", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await LoginLog.create({

      userId: user._id,
      email: user.email,
      role: user.role,

      ipAddress: req.ip,
      country: "Unknown",

      status: "logout",

      riskScore: 0,
      mlScore: 0,

      isAnomaly: false,

      mitreTactic: "Session End",
      mitreTechnique: "User Logout",
      mitreTechniqueId: "T1078",

      anomalyReason: "User logged out normally."

    });

    res.json({
      message: "Logout successful"
    });

  }

  catch (error) {

    console.error(error);

    res.status(401).json({
      message: "Invalid token"
    });

  }

});



// ================= GET USERS =================
router.get("/users", async (req, res) => {

  const users = await User.find().select("-password");

  res.json(users);

});



// ================= GET LOGIN LOGS =================
router.get("/logs", async (req, res) => {

  const logs = await LoginLog.find().sort({
    createdAt: -1
  });

  res.json(logs);

});

// ================= BLOCK / UNBLOCK USER =================
router.put("/users/block/:id", async (req, res) => {

  try {

    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.isBlocked = isBlocked;

    await user.save();

    res.json({
      message: "User status updated"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

// ================= DELETE USER =================
router.delete("/users/:id", async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;