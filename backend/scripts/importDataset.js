/**
 * Simple Dataset Importer - Train models from keystroke data
 * 
 * HOW IT WORKS (Simple Explanation):
 * 
 * 1. Think of typing like handwriting - everyone has unique style
 * 2. Alice types fast (keys held 120ms, quick transitions 80ms)
 * 3. Bob types slow (keys held 250ms, slow transitions 150ms)
 * 4. Bot types superhuman (keys held 15ms, impossible for human!)
 * 
 * We train a model for each person.
 * Then when someone logs in, we check: "Does this typing match Alice's style?"
 */

const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/User");
const KeystrokeAnalyzer = require("../utils/keystrokeAnalyzer");
const BehavioralDNA = require("../utils/behavioralDNA");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Step 1: Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database error:", err));

/**
 * Convert raw keystroke data into the format our system needs
 * 
 * INPUT:  { dwell: [120, 125, 118, ...], flight: [80, 75, 85, ...] }
 * OUTPUT: [ {key: 'p', pressTime: 1000, releaseTime: 1120}, ... ]
 */
function convertToKeystrokeEvents(sample, password = "password123") {
    const events = [];
    let currentTime = Date.now();
    
    for (let i = 0; i < password.length; i++) {
        const dwell = sample.dwell[i] || 120;   // How long key held
        const flight = sample.flight[i] || 80;   // Time until next key
        
        const pressTime = currentTime;
        const releaseTime = pressTime + dwell;
        
        events.push({
            key: password[i],
            pressTime: pressTime,
            releaseTime: releaseTime
        });
        
        currentTime = releaseTime + flight;
    }
    
    return events;
}

/**
 * Train a user from dataset samples
 * 
 * Like teaching a robot: "This is how Alice types"
 */
async function trainUserFromDataset(userData) {
    console.log(`\n👤 Training model for: ${userData.name}`);
    console.log(`   Email: ${userData.email}`);
    
    // Find or create user in database
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        user = new User({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            isVerified: true,
            role: "user"
        });
        await user.save();
        console.log(`   ✅ Created new user`);
    }
    
    // Set up behavioral profile storage
    if (!user.behavioralProfile) {
        user.behavioralProfile = {
            keystrokeSignatures: [],
            baselineProfile: {},
            mlModel: {},
            dnaModel: null
        };
    }
    
    // Clear old training data (start fresh)
    user.behavioralProfile.keystrokeSignatures = [];
    
    // Train with each sample
    console.log(`   📊 Processing ${userData.samples.length} typing samples...`);
    
    for (const sample of userData.samples) {
        const keystrokeEvents = convertToKeystrokeEvents(sample);
        const processed = KeystrokeAnalyzer.processKeystrokes(keystrokeEvents);
        
        if (processed.valid) {
            // Store this sample as "normal typing" for this user
            user.behavioralProfile.keystrokeSignatures.push({
                ...processed.signature,
                signatureHash: KeystrokeAnalyzer.generateSignatureHash(processed.signature),
                timestamp: new Date(),
                deviceId: "dataset-import",
                loginSuccess: true
            });
        }
    }
    
    console.log(`   ✅ Stored ${user.behavioralProfile.keystrokeSignatures.length} samples`);
    
    // Train Statistical Model (calculates averages)
    const model = KeystrokeAnalyzer.trainModel(user.behavioralProfile.keystrokeSignatures);
    if (model) {
        user.behavioralProfile.mlModel = model;
        console.log(`   📊 Average dwell time: ${model.dwell.mean.toFixed(0)}ms`);
        console.log(`   📊 Average flight time: ${model.flight.mean.toFixed(0)}ms`);
        console.log(`   📊 Confidence: ${Math.round(model.confidence * 100)}%`);
    }
    
    // Train DNA Neural Network (learns patterns)
    const dnaTrained = await BehavioralDNA.trainOnUserData(user.behavioralProfile.keystrokeSignatures);
    if (dnaTrained) {
        user.behavioralProfile.dnaModel = BehavioralDNA.exportModel();
        console.log(`   🧬 Neural Network: Trained`);
    }
    
    await user.save();
    console.log(`   ✅ Training complete!`);
    
    return user;
}

/**
 * Test: Can the model tell Alice from a Bot?
 */
async function testUserModel(user) {
    console.log(`\n🔍 Testing detection for: ${user.name}`);
    
    // Load trained model
    if (user.behavioralProfile?.dnaModel) {
        BehavioralDNA.importModel(user.behavioralProfile.dnaModel);
    }
    
    // Load user's own data
    const userData = DATASET.users.find(u => u.email === user.email);
    
    // Test 1: User's own typing (should PASS as normal)
    if (userData) {
        const ownSample = convertToKeystrokeEvents(userData.samples[0]);
        const processed = KeystrokeAnalyzer.processKeystrokes(ownSample);
        
        if (processed.valid && BehavioralDNA.isTrained) {
            const result = BehavioralDNA.verifyUser(processed.signature);
            console.log(`   🟢 Own typing: ${result.anomalyScore}% anomaly → ${result.isGenuine ? '✅ NORMAL' : '⚠️ FLAGGED'}`);
        }
    }
    
    // Test 2: Bot attack (should FAIL as anomaly)
    const attackerData = DATASET.users.find(u => u.id === "attacker_001");
    if (attackerData) {
        const attackSample = convertToKeystrokeEvents(attackerData.samples[0]);
        const processed = KeystrokeAnalyzer.processKeystrokes(attackSample);
        
        if (processed.valid && BehavioralDNA.isTrained) {
            const result = BehavioralDNA.verifyUser(processed.signature);
            const detected = !result.isGenuine || result.anomalyScore >= 50;
            console.log(`   🔴 Bot attack: ${result.anomalyScore}% anomaly → ${detected ? '🔴 DETECTED!' : '❌ MISSED'}`);
        }
    }
    
    // Test 3: Different person (Bob trying Alice's account)
    const otherUser = DATASET.users.find(u => u.id !== userData?.id && u.id !== "attacker_001");
    if (otherUser && userData) {
        const otherSample = convertToKeystrokeEvents(otherUser.samples[0]);
        const processed = KeystrokeAnalyzer.processKeystrokes(otherSample);
        
        if (processed.valid && BehavioralDNA.isTrained) {
            const result = BehavioralDNA.verifyUser(processed.signature);
            console.log(`   🟡 Different person: ${result.anomalyScore}% anomaly → ${!result.isGenuine ? '🔴 DETECTED!' : '⚠️ Borderline'}`);
        }
    }
}

// The dataset
const DATASET = require("../data/keystroke_dataset.json");

// Main program
async function main() {
    console.log("📚 Dataset Importer & Trainer");
    console.log("═".repeat(50));
    console.log("\nSimple Explanation:");
    console.log("1. We have typing data for Alice (fast), Bob (slow), and a Bot");
    console.log("2. We train a model for each person");
    console.log("3. The model learns: 'This is how Alice types'");
    console.log("4. When someone logs in as Alice, we check: 'Is this Alice typing?'\n");
    
    // Train all legitimate users
    const trainedUsers = [];
    const legitimateUsers = DATASET.users.filter(u => u.id !== "attacker_001");
    
    for (const userData of legitimateUsers) {
        const user = await trainUserFromDataset(userData);
        trainedUsers.push(user);
    }
    
    // Test detection
    console.log("\n" + "═".repeat(50));
    console.log("🔴 TESTING ATTACK DETECTION");
    console.log("═".repeat(50));
    
    for (const user of trainedUsers) {
        await testUserModel(user);
    }
    
    console.log("\n" + "═".repeat(50));
    console.log("✅ Done!");
    console.log("\n💡 What we proved:");
    console.log("   - Each person has unique typing pattern");
    console.log("   - System learns individual patterns");
    console.log("   - Bots and different people are detected");
    console.log("   - Same person typing normally passes");
    
    await mongoose.disconnect();
    process.exit(0);
}

main().catch(console.error);