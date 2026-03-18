const express = require("express");
const router = express.Router();
const LoginLog = require("../models/LoginLog");


// ===============================
// Top Attacking IPs
// ===============================
router.get("/top-ips", async (req, res) => {
  try {

    const ips = await LoginLog.aggregate([
      {
        $match: { status: "failed" }
      },
      {
        $group: {
          _id: "$ipAddress",
          attempts: { $sum: 1 }
        }
      },
      {
        $sort: { attempts: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(ips);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching IPs" });
  }
});


// ===============================
// Attack Countries
// ===============================
router.get("/attack-countries", async (req, res) => {
  try {

    const countries = await LoginLog.aggregate([
      {
        $match: { status: "failed" }
      },
      {
        $group: {
          _id: "$country",
          attacks: { $sum: 1 }
        }
      },
      {
        $sort: { attacks: -1 }
      }
    ]);

    res.json(countries);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching countries" });
  }
});


// ===============================
// Fraud Clusters
// ===============================
router.get("/clusters", async (req, res) => {
  try {

    const clusters = await LoginLog.aggregate([
      {
        $match: { status: "failed" }
      },
      {
        $group: {
          _id: "$ipAddress",
          attempts: { $sum: 1 },
          affectedAccounts: { $addToSet: "$email" },
          countries: { $addToSet: "$country" },
          lastAttempt: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          ipAddress: "$_id",
          attempts: 1,
          affectedAccountsCount: { $size: "$affectedAccounts" },
          countries: 1,
          lastAttempt: 1
        }
      },
      {
        $sort: { attempts: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(clusters);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching fraud clusters" });
  }
});

module.exports = router;