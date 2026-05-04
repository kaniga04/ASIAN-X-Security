// ✅ IMPORT real distance function
const getDistance = require("./distance");
const KeystrokeAnalyzer = require("./keystrokeAnalyzer");
const BehavioralDNA = require("./behavioralDNA");
const User = require("../models/User");

/**
 * Enhanced Risk Engine with Behavioral Biometrics
 * Combines traditional rules with Pure JS Neural Network DNA analysis
 */
const calculateRiskScore = async ({
  user,
  loginData,
  recentLogs,
  keystrokeData = null,
  deviceFingerprint = null,
}) => {
  let riskPoints = 0;
  const reasons = [];
  const riskComponents = {
    device: { score: 0, factors: [] },
    location: { score: 0, factors: [] },
    behavioral: { score: 0, factors: [] },
    temporal: { score: 0, factors: [] },
    travel: { score: 0, factors: [] }
  };

  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  /* ================= 🧬 BEHAVIORAL DNA ANALYSIS (Pure JS Neural Network) ================= */
  let keystrokeAnalysis = null;
  let dnaAnalysis = null;
  
  if (keystrokeData && user?.behavioralProfile) {
    try {
      // Process keystroke data
      const processedKeystroke = KeystrokeAnalyzer.processKeystrokes(keystrokeData);
      
      if (processedKeystroke.valid) {
        // First, try the statistical model
        const model = KeystrokeAnalyzer.trainModel(
          user.behavioralProfile.keystrokeSignatures || []
        );
        
        let comparison;
        if (model && model.isReliable) {
          comparison = KeystrokeAnalyzer.compareWithModel(
            processedKeystroke.signature,
            model
          );
        } else {
          comparison = KeystrokeAnalyzer.comparePatterns(
            processedKeystroke.signature,
            user.behavioralProfile.keystrokeSignatures || []
          );
        }
        
        keystrokeAnalysis = comparison;
        
        // 🆕 Load DNA model if available
        if (user.behavioralProfile.dnaModel) {
          BehavioralDNA.importModel(user.behavioralProfile.dnaModel);
        }
        
        // 🆕 Run DNA neural network verification
        dnaAnalysis = BehavioralDNA.verifyUser(processedKeystroke.signature);

        // 🔍 DEBUG
console.log("🧬 DNA Analysis Result:", {
    isGenuine: dnaAnalysis?.isGenuine,
    similarity: dnaAnalysis?.similarity,
    anomalyScore: dnaAnalysis?.anomalyScore,
    threshold: dnaAnalysis?.threshold,
    isTrained: BehavioralDNA.isTrained
});
        
        // Add behavioral risk from statistical model (0-40 points)
        if (comparison.anomalyScore > 0) {
          const behavioralRisk = comparison.anomalyScore * 0.4;
          riskPoints += behavioralRisk;
          riskComponents.behavioral.score = behavioralRisk;
          
          if (comparison.reasons && comparison.reasons.length > 0) {
            comparison.reasons.forEach(reason => {
              reasons.push(reason);
              riskComponents.behavioral.factors.push(reason);
            });
          } else {
            if (comparison.anomalyScore > 70) {
              reasons.push(`High behavioral anomaly detected (${Math.round(comparison.anomalyScore)}% deviation)`);
              riskComponents.behavioral.factors.push('Significant typing pattern deviation');
            } else if (comparison.anomalyScore > 40) {
              reasons.push(`Moderate behavioral anomaly detected (${Math.round(comparison.anomalyScore)}% deviation)`);
              riskComponents.behavioral.factors.push('Moderate typing pattern deviation');
            }
          }
          
          if (comparison.deviations?.dwellDeviation > 0.3) {
            riskComponents.behavioral.factors.push('Unusual key hold duration');
          }
          if (comparison.deviations?.flightDeviation > 0.2) {
            riskComponents.behavioral.factors.push('Unusual typing rhythm');
          }
        }
        
        // 🆕 Add DNA neural network risk (0-50 points)
        if (dnaAnalysis && !dnaAnalysis.isGenuine) {
          const dnaRisk = dnaAnalysis.anomalyScore * 0.5;
          riskPoints += dnaRisk;
          riskComponents.behavioral.score += dnaRisk;
          riskComponents.behavioral.factors.push(dnaAnalysis.reason);
          reasons.push(dnaAnalysis.reason);
          
          // Add detailed DNA metrics
          if (dnaAnalysis.details) {
            riskComponents.behavioral.factors.push(
              `DNA NN Confidence: ${dnaAnalysis.details.nnConfidence}%`
            );
          }
        } else if (dnaAnalysis && dnaAnalysis.isGenuine) {
          riskComponents.behavioral.factors.push(
            `DNA Match: ${dnaAnalysis.similarity}% similar to user baseline`
          );
        }
        
        // Add training status info
        const dnaStatus = BehavioralDNA.getTrainingStatus();
        if (!dnaStatus.readyForVerification) {
          riskComponents.behavioral.factors.push(
            `DNA Learning: ${dnaStatus.trainingSamples}/${dnaStatus.minRequired} samples`
          );
        } else if (comparison.modelConfidence) {
          riskComponents.behavioral.factors.push(
            `Model confidence: ${Math.round(comparison.modelConfidence * 100)}%`
          );
        }
        
        if (comparison.confidence === 'Low') {
          riskComponents.behavioral.factors.push('Insufficient behavioral baseline');
        }
      }
    } catch (error) {
      console.error('Behavioral analysis error:', error);
    }
  }

  /* ================= RULE 1: DEVICE RISK ================= */
  const isNewDevice = !recentLogs.some(log => log.deviceId === loginData.deviceId);
  const deviceTrustScore = user?.behavioralProfile?.deviceTrustScores?.find(
    d => d.deviceId === loginData.deviceId
  )?.trustScore || 0;

  if (isNewDevice) {
    let deviceRiskScore = 15;
    riskComponents.device.factors.push('New device detected');
    
    if (deviceFingerprint) {
      if (deviceFingerprint.isVM || deviceFingerprint.isEmulator) {
        deviceRiskScore += 20;
        riskComponents.device.factors.push('Virtual machine or emulator detected');
        reasons.push('Login from virtual environment detected');
      }
      
      if (deviceFingerprint.isTor || deviceFingerprint.isProxy) {
        deviceRiskScore += 25;
        riskComponents.device.factors.push('Anonymous network detected');
        reasons.push('Login via anonymous network (Tor/Proxy)');
      }
      
      if (deviceFingerprint.isIncognito) {
        deviceRiskScore += 10;
        riskComponents.device.factors.push('Private browsing mode');
      }
    }
    
    riskPoints += deviceRiskScore;
    riskComponents.device.score = deviceRiskScore;
    reasons.push("New device detected");
  } else {
    if (deviceTrustScore < 50) {
      const lowTrustScore = Math.floor((50 - deviceTrustScore) * 0.4);
      riskPoints += lowTrustScore;
      riskComponents.device.score = lowTrustScore;
      riskComponents.device.factors.push(`Low device trust score (${deviceTrustScore})`);
    }
  }

  const deviceUserLogs = recentLogs.filter(log => 
    log.deviceId === loginData.deviceId && 
    log.email !== loginData.email
  );
  
  const uniqueDeviceUsers = [...new Set(deviceUserLogs.map(l => l.email))];
  
  if (uniqueDeviceUsers.length >= 2) {
    const multiUserScore = Math.min(30, uniqueDeviceUsers.length * 10);
    riskPoints += multiUserScore;
    riskComponents.device.score += multiUserScore;
    riskComponents.device.factors.push(`Device used by ${uniqueDeviceUsers.length} different users`);
    reasons.push(`Multiple users (${uniqueDeviceUsers.length}) using same device`);
  }

  /* ================= RULE 2: LOCATION & TRAVEL RISK ================= */
  const lastLogin = recentLogs[0];
  const userCountry = loginData.country;
  
  if (lastLogin && userCountry && lastLogin.country !== userCountry) {
    let locationScore = 10;
    riskComponents.location.factors.push('Country changed from previous login');
    
    const highRiskCountries = ['Russia', 'North Korea', 'Iran', 'Syria', 'Afghanistan'];
    if (highRiskCountries.includes(userCountry)) {
      locationScore += 20;
      riskComponents.location.factors.push('Login from high-risk country');
    }
    
    riskPoints += locationScore;
    riskComponents.location.score = locationScore;
    reasons.push(`Login from new country: ${userCountry}`);
  }

  if (
    lastLogin &&
    lastLogin.latitude &&
    lastLogin.longitude &&
    loginData.latitude &&
    loginData.longitude
  ) {
    const timeDiff = (Date.now() - new Date(lastLogin.createdAt)) / (1000 * 60 * 60);
    const distance = getDistance(
      lastLogin.latitude,
      lastLogin.longitude,
      loginData.latitude,
      loginData.longitude
    );
    const speed = distance / (timeDiff || 0.01);
    
    const travelAnalysis = {
      distanceTraveled: distance,
      timeSinceLastLogin: timeDiff,
      travelSpeed: speed,
      impossibleTravel: false,
      travelRiskScore: 0
    };

    const MAX_REALISTIC_SPEED = 800;
    const SUSPICIOUS_SPEED = 500;
    
    if (speed > MAX_REALISTIC_SPEED && distance > 100) {
      const travelScore = Math.min(50, Math.floor(speed / 20));
      riskPoints += travelScore;
      riskComponents.travel.score = travelScore;
      riskComponents.travel.factors.push(`Impossible travel: ${Math.round(distance)}km in ${Math.round(timeDiff)}h`);
      travelAnalysis.impossibleTravel = true;
      travelAnalysis.travelRiskScore = travelScore;
      reasons.push(`Impossible travel detected (${Math.round(speed)} km/h)`);
    } else if (speed > SUSPICIOUS_SPEED && distance > 200) {
      const travelScore = 20;
      riskPoints += travelScore;
      riskComponents.travel.score = travelScore;
      riskComponents.travel.factors.push(`Unusually fast travel: ${Math.round(speed)} km/h`);
      travelAnalysis.travelRiskScore = travelScore;
      reasons.push(`Unusually fast travel detected`);
    } else if (distance > 5000) {
      riskComponents.travel.factors.push(`Long distance travel: ${Math.round(distance)}km`);
    }

    loginData.travelAnalysis = travelAnalysis;
  }

  /* ================= RULE 3: TEMPORAL ANALYSIS ================= */
  const userTypicalHours = await getUserTypicalLoginHours(user?.email, recentLogs);
  
  if (userTypicalHours && userTypicalHours.length > 0) {
    const isUnusualTime = !userTypicalHours.includes(currentHour);
    
    if (isUnusualTime) {
      let temporalScore = 10;
      riskComponents.temporal.factors.push(`Login outside typical hours (${currentHour}:00)`);
      
      if (currentHour >= 1 && currentHour <= 4) {
        temporalScore += 15;
        riskComponents.temporal.factors.push('Login during suspicious hours (1-4 AM)');
        reasons.push('Login during high-risk hours');
      }
      
      riskPoints += temporalScore;
      riskComponents.temporal.score = temporalScore;
    }
  }

  const isWeekend = currentDay === 0 || currentDay === 6;
  const userWeekendLogins = recentLogs.filter(log => {
    const day = new Date(log.createdAt).getDay();
    return day === 0 || day === 6;
  });
  
  if (!isWeekend && recentLogs.length > 5) {
    const weekendRatio = userWeekendLogins.length / recentLogs.length;
    if (weekendRatio < 0.1) {
      riskPoints += 5;
      riskComponents.temporal.factors.push('Unusual weekend login');
    }
  }

  /* ================= RULE 4: FAILED ATTEMPTS & BRUTE FORCE ================= */
  const recentFailures = recentLogs.filter(
    log =>
      log.status === "failed" &&
      new Date(log.createdAt) > Date.now() - 15 * 60 * 1000
  );

  if (recentFailures.length >= 3) {
    let failureScore = 0;
    
    if (recentFailures.length <= 5) {
      failureScore = 15;
    } else if (recentFailures.length <= 10) {
      failureScore = 25;
    } else {
      failureScore = 40;
    }
    
    riskPoints += failureScore;
    riskComponents.device.score += failureScore;
    riskComponents.device.factors.push(`${recentFailures.length} failed attempts in last 15 minutes`);
    reasons.push(`Multiple failed login attempts (${recentFailures.length})`);
  }

  const recentFailedIPs = [...new Set(recentFailures.map(f => f.ipAddress))];
  if (recentFailedIPs.length >= 3 && recentFailures.length >= 5) {
    const distributedScore = 30;
    riskPoints += distributedScore;
    riskComponents.device.factors.push('Distributed attack pattern detected');
    reasons.push('Login attempts from multiple IP addresses');
  }

  /* ================= RULE 5: VELOCITY CHECKS ================= */
  const recentLoginsLastMinute = recentLogs.filter(
    log => new Date(log.createdAt) > Date.now() - 60 * 1000
  );
  
  if (recentLoginsLastMinute.length >= 3) {
    const velocityScore = Math.min(20, recentLoginsLastMinute.length * 5);
    riskPoints += velocityScore;
    riskComponents.device.factors.push('Rapid successive logins detected');
    reasons.push('Unusual login frequency detected');
  }

  /* ================= RULE 6: IP REPUTATION ================= */
  const recentIPs = recentLogs.slice(0, 10).map(l => l.ipAddress);
  const ipChangeCount = recentIPs.filter(ip => ip !== loginData.ipAddress).length;
  
  if (ipChangeCount >= 5 && recentLogs.length >= 5) {
    const ipVolatilityScore = 15;
    riskPoints += ipVolatilityScore;
    riskComponents.location.factors.push('Frequent IP address changes');
    reasons.push('Highly volatile IP address pattern');
  }

  /* ================= USER RISK PROFILE INTEGRATION ================= */
  if (user?.behavioralProfile?.riskProfile) {
    const userRiskLevel = user.behavioralProfile.riskProfile.riskLevel;
    
    if (userRiskLevel === 'High' || userRiskLevel === 'Critical') {
      riskPoints += 15;
      reasons.push('Account has historical high-risk profile');
    }
    
    if (user.behavioralProfile.riskProfile.blockedAttempts > 0) {
      riskPoints += 10;
      reasons.push('Account has previous blocked login attempts');
    }
  }

  /* ================= TRUSTED FACTORS (Risk Reduction) ================= */
  let riskReduction = 0;
  
  if (user?.trustedFactors?.trustedDevices?.some(d => d.deviceId === loginData.deviceId)) {
    riskReduction += 15;
    reasons.push('Login from trusted device');
  }
  
  if (user?.trustedFactors?.trustedLocations?.some(loc => {
    if (!loginData.latitude || !loginData.longitude) return false;
    const dist = getDistance(
      loginData.latitude, loginData.longitude,
      loc.latitude, loc.longitude
    );
    return dist <= (loc.radius || 50);
  })) {
    riskReduction += 10;
    reasons.push('Login from trusted location');
  }
  
  if (user?.trustedFactors?.trustedIPs?.some(ip => ip.ip === loginData.ipAddress)) {
    riskReduction += 10;
    reasons.push('Login from trusted IP address');
  }
  
  riskPoints = Math.max(0, riskPoints - riskReduction);

  /* ================= 🆕 ADVANCED ATTACK DETECTION ================= */
const AdvancedAttackDetector = require('./advancedAttackDetector');

const attackResults = AdvancedAttackDetector.runAllDetections({
    ip: loginData.ipAddress,
    email: loginData.email || user?.email,
    userAgent: loginData.userAgent,
    keystrokeData: keystrokeData,
    recentLogs: recentLogs,
    sessionId: loginData.sessionId,
    userId: user?._id,
    requestTiming: Date.now() - (loginData.requestStartTime || Date.now()),
    formFillTime: loginData.formFillTime
});

if (attackResults.detectedAttacks.length > 0) {
    const attackRisk = attackResults.additionalRisk * 0.5;
    riskPoints += attackRisk;
    
    attackResults.detectedAttacks.forEach(attack => {
        reasons.push(`${attack.attackType}: ${attack.details}`);
        riskComponents.device.factors.push(attack.details);
    });
    
    console.log('🛡️ Advanced Attack Detected:', attackResults.summary);
}

  /* ================= FINAL RISK CALCULATION ================= */
  const finalRisk = Math.min(100, Math.round(riskPoints));

  let riskLevel = "Low";
  if (finalRisk >= 80) riskLevel = "Critical";
  else if (finalRisk >= 60) riskLevel = "High";
  else if (finalRisk >= 30) riskLevel = "Medium";

  const confidenceScore = calculateConfidenceScore(riskComponents, recentLogs.length);
  const mitreMapping = generateMITREMapping(riskComponents, reasons);
  const threatExplanation = generateThreatExplanation(
    finalRisk, 
    riskLevel, 
    reasons, 
    riskComponents,
    keystrokeAnalysis,
    dnaAnalysis
  );

  return {
    riskScore: finalRisk,
    riskLevel,
    reasons: reasons.length > 0 ? reasons : ["Normal activity"],
    riskComponents,
    confidenceScore,
    mitreMapping,
    threatExplanation,
    keystrokeAnalysis,
    dnaAnalysis,
    travelAnalysis: loginData.travelAnalysis || null,
    requiresMFA: finalRisk >= 60,
    shouldBlock: finalRisk >= 85,
    recommendations: generateRecommendations(finalRisk, riskComponents, riskLevel)
  };
};

/* ================= HELPER FUNCTIONS ================= */

async function getUserTypicalLoginHours(email, recentLogs) {
  if (!recentLogs || recentLogs.length < 5) return null;
  
  const hourFrequency = {};
  recentLogs.forEach(log => {
    const hour = new Date(log.createdAt).getHours();
    hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
  });
  
  const total = recentLogs.length;
  const typicalHours = Object.entries(hourFrequency)
    .filter(([_, count]) => count / total > 0.1)
    .map(([hour]) => parseInt(hour));
  
  return typicalHours.length > 0 ? typicalHours : null;
}

function calculateConfidenceScore(riskComponents, totalLogs) {
  let confidence = 50;
  confidence += Math.min(30, totalLogs * 2);
  
  if (riskComponents.behavioral.score > 0 || riskComponents.behavioral.factors.length > 0) {
    confidence += 15;
  }
  
  const activeFactors = Object.values(riskComponents).filter(c => c.score > 0).length;
  confidence -= activeFactors * 5;
  
  return Math.min(100, Math.max(0, confidence));
}

function generateMITREMapping(riskComponents, reasons) {
  const mapping = {
    tactics: [],
    techniques: [],
    subTechniques: []
  };
  
  if (riskComponents.device.factors.some(f => f.includes('failed attempts'))) {
    mapping.tactics.push({
      id: 'TA0001',
      name: 'Initial Access',
      description: 'The adversary is trying to get into your network.'
    });
    mapping.techniques.push({
      id: 'T1110',
      name: 'Brute Force',
      description: 'Adversaries may use brute force techniques to gain access to accounts.',
      detection: 'Monitor for many failed authentication attempts across various accounts.'
    });
  }
  
  if (riskComponents.device.factors.some(f => f.includes('virtual'))) {
    mapping.tactics.push({
      id: 'TA0005',
      name: 'Defense Evasion',
      description: 'The adversary is trying to avoid being detected.'
    });
    mapping.techniques.push({
      id: 'T1497',
      name: 'Virtualization/Sandbox Evasion',
      description: 'Adversaries may check for virtual environments to avoid analysis.'
    });
  }
  
  if (reasons.some(r => r.includes('Multiple users'))) {
    mapping.tactics.push({
      id: 'TA0006',
      name: 'Credential Access',
      description: 'The adversary is trying to steal account credentials.'
    });
    mapping.techniques.push({
      id: 'T1078',
      name: 'Valid Accounts',
      description: 'Adversaries may use compromised credentials from multiple users.'
    });
  }
  
  if (riskComponents.behavioral.score > 20) {
    mapping.techniques.push({
      id: 'T1078.003',
      name: 'Behavioral DNA Mismatch',
      description: 'Neural network detected typing pattern anomaly - potential account takeover.',
      detection: 'Keystroke dynamics neural network shows significant deviation from user baseline.'
    });
  }
  
  return mapping;
}

function generateThreatExplanation(riskScore, riskLevel, reasons, riskComponents, keystrokeAnalysis, dnaAnalysis) {
  const explanation = {
    title: riskLevel === 'Critical' ? 'Critical Security Threat Detected' :
           riskLevel === 'High' ? 'High Risk Login Activity' :
           riskLevel === 'Medium' ? 'Suspicious Login Activity' : 'Normal Login Activity',
    riskLevel,
    reasons,
    recommendations: [],
    detailedAnalysis: {
      summary: '',
      technicalDetails: '',
      impact: '',
      urgency: riskLevel
    }
  };
  
  if (riskScore >= 80) {
    explanation.detailedAnalysis.summary = 'Multiple high-risk indicators detected. This login attempt shows strong signs of malicious activity.';
    explanation.detailedAnalysis.impact = 'Immediate action required to prevent potential account compromise.';
  } else if (riskScore >= 60) {
    explanation.detailedAnalysis.summary = 'Several suspicious patterns detected. This login requires additional verification.';
    explanation.detailedAnalysis.impact = 'Moderate risk of unauthorized access. MFA verification recommended.';
  } else if (riskScore >= 30) {
    explanation.detailedAnalysis.summary = 'Some unusual activity detected, but likely legitimate with minor anomalies.';
    explanation.detailedAnalysis.impact = 'Low risk, but monitoring recommended.';
  } else {
    explanation.detailedAnalysis.summary = 'Login activity appears normal and consistent with historical patterns.';
    explanation.detailedAnalysis.impact = 'No immediate action required.';
  }
  
  const technicalDetails = [];
  
  if (dnaAnalysis && dnaAnalysis.anomalyScore > 0) {
    technicalDetails.push(`🧬 DNA Neural Network: ${dnaAnalysis.similarity}% match (Threshold: ${dnaAnalysis.threshold}%)`);
    if (dnaAnalysis.details) {
      technicalDetails.push(`NN Confidence: ${dnaAnalysis.details.nnConfidence}%, Cosine: ${dnaAnalysis.details.cosineSimilarity}%`);
    }
  }
  
  if (keystrokeAnalysis?.anomalyScore > 40) {
    technicalDetails.push(`Statistical anomaly: ${Math.round(keystrokeAnalysis.anomalyScore)}%`);
  }
  
  if (riskComponents.travel.score > 0) {
    technicalDetails.push(`Travel risk: ${riskComponents.travel.score}`);
  }
  
  if (riskComponents.device.score > 0) {
    technicalDetails.push(`Device risk: ${riskComponents.device.score}`);
  }
  
  explanation.detailedAnalysis.technicalDetails = technicalDetails.join('; ');
  
  return explanation;
}

function generateRecommendations(riskScore, riskComponents, riskLevel) {
  const recommendations = [];
  
  if (riskLevel === 'Critical' || riskLevel === 'High') {
    recommendations.push('Immediate password reset recommended');
    recommendations.push('Enable Multi-Factor Authentication immediately');
    recommendations.push('Review recent account activity for unauthorized actions');
    recommendations.push('Contact security team for investigation');
  } else if (riskLevel === 'Medium') {
    recommendations.push('Consider enabling Multi-Factor Authentication');
    recommendations.push('Review login history for unfamiliar activity');
    recommendations.push('Verify this was a legitimate login attempt');
  }
  
  if (riskComponents.travel.score > 30) {
    recommendations.push('Verify travel plans with user');
  }
  
  if (riskComponents.behavioral.score > 40) {
    recommendations.push('Unusual typing pattern detected - verify user identity');
  }
  
  if (riskComponents.device.factors.some(f => f.includes('failed attempts'))) {
    recommendations.push('Consider implementing account lockout policies');
  }
  
  return recommendations;
}

module.exports = calculateRiskScore;