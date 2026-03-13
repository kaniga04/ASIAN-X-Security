const express = require("express");
const router = express.Router();
const LoginLog = require("../models/LoginLog");

router.post("/query", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  try {
    // Rule-Based Layer
    if (lowerMsg.includes("top attacking ip")) {
      const topIPs = await LoginLog.aggregate([
        { $match: { status: "failed" } },
        {
          $group: {
            _id: "$ipAddress",
            attempts: { $sum: 1 }
          }
        },
        { $sort: { attempts: -1 } },
        { $limit: 3 }
      ]);

      return res.json({
        reply: `Top attacking IP is ${topIPs[0]?._id} with ${topIPs[0]?.attempts} attempts.`
      });
    }

    if (lowerMsg.includes("total failed")) {
      const count = await LoginLog.countDocuments({ status: "failed" });

      return res.json({
        reply: `Total failed login attempts: ${count}`
      });
    }

    if (lowerMsg.includes("anomalies")) {
      const count = await LoginLog.countDocuments({ isAnomaly: true });

      return res.json({
        reply: `Total detected anomalies: ${count}`
      });
    }

    // AI fallback (simple smart response)
    return res.json({
      reply:
        "I understand you're asking about fraud analysis. Try asking about top attacking IPs, anomalies, or failed logins."
    });

  } catch (error) {
    res.status(500).json({ reply: "Error processing request." });
  }
});

module.exports = router;