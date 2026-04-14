const express = require("express");
const router = express.Router();

const LoginLog = require("../models/LoginLog");

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

module.exports = router;