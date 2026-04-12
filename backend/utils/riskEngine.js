const calculateRiskScore = async ({
  user,
  loginData,
  recentLogs,
}) => {
  let riskPoints = 0;
  const reasons = [];

  const currentHour = new Date().getHours();

  /* ================= RULE 1 ================= */
  // Same device + multiple users + midnight
  const midnightLogs = recentLogs.filter(log =>
    log.device === loginData.device &&
    new Date(log.createdAt).getHours() >= 0 &&
    new Date(log.createdAt).getHours() <= 5
  );

  const uniqueUsers = [...new Set(midnightLogs.map(l => l.email))];

  if (uniqueUsers.length >= 3 && currentHour <= 5) {
    const extra = uniqueUsers.length - 2;
    const points = Math.min(25, extra * 10);
    riskPoints += points + 15;

    reasons.push(`Multiple users on same device at midnight`);
  }

  /* ================= RULE 2 ================= */
  // Impossible travel
  const lastLogin = recentLogs[0]; // latest log

  if (lastLogin && lastLogin.device === loginData.device) {
    const timeDiff =
      (Date.now() - new Date(lastLogin.createdAt)) / (1000 * 60 * 60);

    const distance = getDistance(lastLogin.state, loginData.state);

    const speed = distance / (timeDiff || 1);

    if (timeDiff < 1 && speed > 800) {
      riskPoints += 40;
      reasons.push("Impossible travel detected");
    }
  }

  /* ================= RULE 3 ================= */
  // New device + failed attempts
  const isNewDevice = !recentLogs.some(
    log => log.device === loginData.device
  );

  if (isNewDevice) {
    riskPoints += 15;
    reasons.push("New device detected");

    if (loginData.failedAttempts > 2) {
      const failPoints = Math.min(20, loginData.failedAttempts * 3);
      riskPoints += failPoints;
    }
  }

  /* ================= RULE 4 ================= */
  // Brute force
  const recentFailures = recentLogs.filter(
    log =>
      log.status === "failed" &&
      new Date(log.createdAt) > Date.now() - 15 * 60 * 1000
  );

  if (recentFailures.length >= 5) {
    if (recentFailures.length <= 10) riskPoints += 15;
    else if (recentFailures.length <= 20) riskPoints += 25;
    else riskPoints += 35;

    reasons.push("Multiple failed attempts detected");
  }

  /* ================= RULE 5 ================= */
  if (
    riskPoints === 0 &&
    loginData.failedAttempts <= 2
  ) {
    return {
      riskScore: 0,
      riskLevel: "Normal",
      reasons: ["Normal activity"],
    };
  }

  const finalRisk = Math.min(100, riskPoints);

  let riskLevel = "Low";
  if (finalRisk > 60) riskLevel = "High";
  else if (finalRisk > 30) riskLevel = "Medium";

  return {
    riskScore: finalRisk,
    riskLevel,
    reasons,
  };
};

/* ================= HELPER ================= */
const getDistance = (state1, state2) => {
  if (state1 === state2) return 50;

  const map = {
    TN_DL: 2200,
    KA_TN: 350,
  };

  return map[`${state1}_${state2}`] || 1000;
};

module.exports = calculateRiskScore;