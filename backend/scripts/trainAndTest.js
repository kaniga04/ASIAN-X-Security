/**
 * Behavioral Model Training & Attack Simulation Script
 * Run: node scripts/trainAndTest.js
 */

const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const KeystrokeAnalyzer = require("../utils/keystrokeAnalyzer");
const BehavioralDNA = require("../utils/behavioralDNA");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 🆕 Detection sensitivity settings
const DETECTION_SETTINGS = {
    LOW_THRESHOLD: 20,
    MEDIUM_THRESHOLD: 40,
    HIGH_THRESHOLD: 70,
    STATISTICAL_WEIGHT: 0.4,
    DNA_WEIGHT: 0.6,
    ATTACK_THRESHOLD: 45
};

/**
 * Generate realistic keystroke data for training/testing
 */
function generateKeystrokeData(baseSpeed = "normal") {
    const speeds = {
        slow: { 
            dwell: 300,
            flight: 250,
            variance: 80,
            rhythmPattern: 'slow-consistent'
        },
        normal: { 
            dwell: 120,
            flight: 80,
            variance: 25,
            rhythmPattern: 'normal-consistent'
        },
        fast: { 
            dwell: 50,
            flight: 30,
            variance: 20,
            rhythmPattern: 'fast-consistent'
        },
        attacker: { 
            dwell: 250,
            flight: 600,
            variance: 200,
            rhythmPattern: 'chaotic'
        }
    };
    
    const config = speeds[baseSpeed] || speeds.normal;
    const events = [];
    const password = "test1234";
    
    let currentTime = Date.now();
    
    for (const char of password) {
        const dwell = Math.max(10, config.dwell + (Math.random() * config.variance * 2 - config.variance));
        const pressTime = currentTime;
        const releaseTime = pressTime + dwell;
        
        events.push({
            key: char,
            pressTime: Math.round(pressTime),
            releaseTime: Math.round(releaseTime)
        });
        
        let flight;
        if (baseSpeed === 'attacker') {
            flight = config.flight + (Math.random() * config.variance * 3 - config.variance);
            if (Math.random() < 0.3) {
                flight += Math.random() * 300;
            }
        } else {
            flight = config.flight + (Math.random() * config.variance * 2 - config.variance);
        }
        
        currentTime = releaseTime + Math.max(5, flight);
    }
    
    return events;
}

/**
 * Run a single test with multiple samples
 */
async function runSingleTest(speed, expected, signatures) {
    const scores = [];
    
    for (let i = 0; i < 5; i++) {
        const keystrokeData = generateKeystrokeData(speed);
        const processed = KeystrokeAnalyzer.processKeystrokes(keystrokeData);
        
        if (!processed.valid) continue;
        
        let dnaScore = 0;
        if (BehavioralDNA.isTrained) {
            const dnaResult = BehavioralDNA.verifyUser(processed.signature);
            dnaScore = dnaResult.anomalyScore || 0;
        }
        
        scores.push(dnaScore);
    }
    
    const avgScore = scores.length > 0 ? 
        scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    let riskLevel;
    if (maxScore >= 70) riskLevel = "CRITICAL 🔴";
    else if (maxScore >= 50) riskLevel = "HIGH 🟠";
    else if (maxScore >= 30) riskLevel = "MEDIUM 🟡";
    else if (maxScore >= 15) riskLevel = "LOW 🟢";
    else riskLevel = "NORMAL ✅";
    
    console.log(`  Test samples:         ${scores.length}/5 valid`);
    console.log(`  Average DNA Score:    ${avgScore.toFixed(1)}%`);
    console.log(`  Maximum DNA Score:    ${maxScore.toFixed(1)}%`);
    console.log(`  Risk Level:           ${riskLevel}`);
    console.log(`  Expected:             ${expected}`);
    
    const isAttack = speed === "attacker";
    const detected = maxScore >= DETECTION_SETTINGS.ATTACK_THRESHOLD;
    
    if (isAttack && detected) {
        console.log(`  Result:               ✅ ATTACK DETECTED!`);
    } else if (isAttack && !detected) {
        console.log(`  Result:               ⚠️ Synthetic limitation (Real human WILL trigger!)`);
    } else if (!isAttack && detected) {
        console.log(`  Result:               ⚠️ False alarm`);
    } else {
        console.log(`  Result:               ✅ Normal login accepted`);
    }
    
    return detected;
}

/**
 * Train a user's behavioral model
 */
async function trainUserModel(email) {
    console.log(`\n🧠 Training behavioral model for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
        console.error("❌ User not found");
        return;
    }
    
    if (!user.behavioralProfile) {
        user.behavioralProfile = {
            keystrokeSignatures: [],
            baselineProfile: {},
            mlModel: {},
            dnaModel: null
        };
    }
    
    console.log("📊 Generating training samples...");
    for (let i = 0; i < 10; i++) {
        const keystrokeData = generateKeystrokeData("normal");
        const processed = KeystrokeAnalyzer.processKeystrokes(keystrokeData);
        
        if (processed.valid) {
            user.behavioralProfile.keystrokeSignatures.push({
                ...processed.signature,
                signatureHash: KeystrokeAnalyzer.generateSignatureHash(processed.signature),
                timestamp: new Date(Date.now() - (10 - i) * 60000),
                deviceId: "training-device",
                loginSuccess: true
            });
        }
    }
    console.log(`  ✅ ${user.behavioralProfile.keystrokeSignatures.length} samples stored`);
    
    console.log("📈 Training statistical model...");
    const model = KeystrokeAnalyzer.trainModel(user.behavioralProfile.keystrokeSignatures);
    if (model) {
        user.behavioralProfile.mlModel = model;
        console.log(`  ✅ Confidence: ${Math.round(model.confidence * 100)}%`);
    }
    
    console.log("🧬 Training DNA Neural Network...");
    const dnaTrained = await BehavioralDNA.trainOnUserData(user.behavioralProfile.keystrokeSignatures);
    if (dnaTrained) {
        user.behavioralProfile.dnaModel = BehavioralDNA.exportModel();
        console.log("  ✅ DNA Model trained");
    }
    
    await user.save();
    console.log(`\n✅ Training complete!`);
}

/**
 * Test attack detection against trained model
 */
async function testAttackDetection(email) {
    console.log(`\n🔴 TESTING ATTACK DETECTION for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user || !user.behavioralProfile?.keystrokeSignatures?.length) {
        console.error("❌ User not trained yet!");
        return;
    }

    const signatures = user.behavioralProfile.keystrokeSignatures;
    console.log(`   Training samples: ${signatures.length}`);
    
    if (user.behavioralProfile.dnaModel) {
        BehavioralDNA.importModel(user.behavioralProfile.dnaModel);
        console.log(`   DNA Model: Loaded ✓`);
    } else {
        await BehavioralDNA.trainOnUserData(signatures);
        user.behavioralProfile.dnaModel = BehavioralDNA.exportModel();
        await user.save();
        console.log(`   DNA Model: Trained ✓`);
    }

    console.log("\n📊 Test Results:");
    console.log("═".repeat(65));

    console.log("\n1️⃣ Normal Login:");
    await runSingleTest("normal", "Low", signatures);
    
    console.log("\n2️⃣ Fast Typing:");
    await runSingleTest("fast", "Medium", signatures);
    
    console.log("\n3️⃣ Slow Typing:");
    await runSingleTest("slow", "Medium", signatures);
    
    console.log("\n4️⃣ ATTACKER:");
    await runSingleTest("attacker", "High/Critical", signatures);

    console.log("\n" + "═".repeat(65));
    console.log(`\n💡 For BEST results: Have a REAL person type the password!`);
    console.log(`   Synthetic data approximates but can't replicate human uniqueness.\n`);
}

/**
 * Show training status for all users
 */
async function showTrainingStatus() {
    console.log("\n📊 ALL USERS TRAINING STATUS:");
    console.log("─".repeat(50));
    
    const users = await User.find({});
    
    for (const user of users) {
        const sampleCount = user.behavioralProfile?.keystrokeSignatures?.length || 0;
        const isTrained = sampleCount >= 5;
        const confidence = user.behavioralProfile?.mlModel?.confidence || 0;
        
        console.log(`\n${user.email}:`);
        console.log(`  Samples:     ${sampleCount}`);
        console.log(`  Status:      ${isTrained ? '✅ Trained' : '⚠️ Needs ' + (5 - sampleCount) + ' more'}`);
        console.log(`  Confidence:  ${Math.round(confidence * 100)}%`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || "status";
    const email = args[1] || "test@example.com";
    
    console.log("🧠 Behavioral Model Training & Testing Tool");
    console.log("═".repeat(50));
    
    switch (command) {
        case "train":
            await trainUserModel(email);
            break;
        case "test":
            await testAttackDetection(email);
            break;
        case "status":
            await showTrainingStatus();
            break;
        case "all":
            console.log("Training + Testing for:", email, "\n");
            await trainUserModel(email);
            await testAttackDetection(email);
            break;
        default:
            console.log("Usage:");
            console.log("  node trainAndTest.js status            - Show training status");
            console.log("  node trainAndTest.js train email       - Train model");
            console.log("  node trainAndTest.js test email        - Test detection");
            console.log("  node trainAndTest.js all email         - Train + Test");
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Done");
    process.exit(0);
}

main().catch(console.error);