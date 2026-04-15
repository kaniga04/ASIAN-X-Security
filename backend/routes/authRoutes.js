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

    /* ================= GEO + DEVICE ================= */

    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);

    const country = geo?.country || "Unknown";
const state = geo?.region || "Unknown";
const lat = geo?.ll?.[0] || null;
const lon = geo?.ll?.[1] || null;

    // ✅ IMPORTANT: GET LAT/LON
    const latitude = geo?.ll?.[0] || 0;
    const longitude = geo?.ll?.[1] || 0;

    const deviceInfo = getDeviceInfo(req);

    /* ================= RECENT LOGS ================= */

    const recentLogs = await LoginLog.find({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(20);

    /* ================= RISK ================= */

    const risk = await calculateRiskScore({
      user,
      loginData: {
        device: deviceInfo.device,
        state,
         latitude: lat,
    longitude: lon,      // ✅ added
        failedAttempts: 0,
      },
      recentLogs,
    });

    /* ================= SAVE LOG ================= */

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      country,
      state,
       latitude: lat,
  longitude: lon,       // ✅ added
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

    /* ================= TOKEN ================= */

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