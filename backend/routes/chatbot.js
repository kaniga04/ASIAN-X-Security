const express = require("express");
const router = express.Router();
const LoginLog = require("../models/LoginLog");

// POST /api/chatbot/query
router.post("/query", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  try {
    // 🔹 Top attacking IP
    if (lowerMsg.includes("top ip")) {
      const result = await LoginLog.aggregate([
        { $match: { status: "failed" } },
        { $group: { _id: "$ip", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      if (result.length > 0) {
        return res.json({
          reply: `Top attacking IP: ${result[0]._id} with ${result[0].count} failed attempts.`
        });
      } else {
        return res.json({ reply: "No failed login attempts found." });
      }
    }

    // 🔹 Failed login count
    if (lowerMsg.includes("failed")) {
      const count = await LoginLog.countDocuments({ status: "failed" });
      return res.json({
        reply: `Total failed login attempts: ${count}`
      });
    }

    // 🔹 High risk users
    if (lowerMsg.includes("high risk")) {
      const count = await LoginLog.countDocuments({ riskLevel: "High" });
      return res.json({
        reply: `High risk login attempts: ${count}`
      });
    }

    // 🔹 Default reply
    return res.json({
      reply: "Ask about top IP, failed logins, or high risk activity."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error" });
  }
});

module.exports = router;