const express = require("express");
const router = express.Router();

const LoginLog = require("../models/LoginLog");

/* ✅ TEST ROUTE */
router.get("/test", (req, res) => {
  res.send("Case routes working ✅");
});

/* ============================= */
/* RESOLVE ANOMALY */
/* ============================= */

router.put("/resolve/:id", async (req, res) => {
  try {

    const { actionTaken, threatType, notes } = req.body;

    const updated = await LoginLog.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        actionTaken,
        threatType,
        notes
      },
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Resolve failed" });
  }
});

/* ============================= */
/* DETECT ATTACK CAMPAIGNS */
/* ============================= */

router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await LoginLog.aggregate([
      {
        $match: {
          isAnomaly: true
        }
      },
      {
        $group: {
          _id: "$ipAddress",
          users: { $addToSet: "$email" },
          count: { $sum: 1 },
          firstSeen: { $min: "$createdAt" },
          lastSeen: { $max: "$createdAt" }
        }
      },
      {
        $match: {
          count: { $gte: 3 } // 🔥 threshold (same IP ≥ 3 attacks)
        }
      },
      {
        $project: {
          ipAddress: "$_id",
          affectedUsers: "$users",
          attackCount: "$count",
          firstSeen: 1,
          lastSeen: 1,
          _id: 0
        }
      }
    ]);

    res.json(campaigns);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Campaign detection failed" });
  }
});

module.exports = router;