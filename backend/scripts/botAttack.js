/**
 * Bot Attack Simulation - Types at superhuman speed
 * Run: node scripts/botAttack.js testcase@gmail.com Testcase@1
 */

const axios = require("axios");

const API_URL = "http://localhost:5000/api/auth/login";

/**
 * Generate BOT keystroke data - SUPERHUMAN speed
 */
function generateBotKeystrokes(password) {
    const events = [];
    let currentTime = Date.now();
    
    for (const char of password) {
        const dwell = 15 + Math.random() * 10;     // 15-25ms (human is 100-200ms)
        const flight = 5 + Math.random() * 5;       // 5-10ms (human is 50-150ms)
        
        const pressTime = currentTime;
        const releaseTime = pressTime + dwell;
        
        events.push({
            key: char,
            pressTime: Math.round(pressTime),
            releaseTime: Math.round(releaseTime)
        });
        
        currentTime = releaseTime + flight;
    }
    
    return events;
}

/**
 * Generate PASTE attack - Instant paste
 */
function generatePasteAttack(password) {
    const events = [];
    const currentTime = Date.now();
    
    for (let i = 0; i < password.length; i++) {
        events.push({
            key: password[i],
            pressTime: currentTime,
            releaseTime: currentTime + 2
        });
    }
    
    return events;
}

/**
 * Generate BRUTE FORCE bot
 */
function generateBruteForceBot(password) {
    const events = [];
    let currentTime = Date.now();
    
    for (const char of password) {
        const dwell = 30 + Math.random() * 20;
        const flight = 100 + Math.random() * 300;
        
        const pressTime = currentTime;
        const releaseTime = pressTime + dwell;
        
        events.push({
            key: char,
            pressTime: Math.round(pressTime),
            releaseTime: Math.round(releaseTime)
        });
        
        currentTime = releaseTime + flight;
    }
    
    return events;
}

/**
 * Send login request with keystroke data
 */
async function sendLogin(email, password, keystrokeData, label) {
    try {
        const response = await axios.post(API_URL, {
            email,
            password,
            deviceId: "bot-attack-simulator",
            keystrokeData
        });
        
        console.log(`   ${label}: Score: ${response.data.riskAssessment?.score || 0}/100 - ${response.data.riskAssessment?.level || "N/A"}`);
        return response.data;
    } catch (error) {
        if (error.response?.data?.riskScore) {
            console.log(`   ${label}: Score: ${error.response.data.riskScore}/100 - CRITICAL (Blocked)`);
        } else {
            console.log(`   ${label}: Error - ${error.response?.data?.message || error.message}`);
        }
        return null;
    }
}

/**
 * Run bot attack simulation
 */
async function runBotAttack(email, password) {
    console.log("\n" + "═".repeat(65));
    console.log("🤖 BOT ATTACK SIMULATION");
    console.log("═".repeat(65));
    console.log(`Target: ${email}`);
    console.log(`Password: ${"*".repeat(password.length)}`);
    
    // Normal human login
    console.log("\n1️⃣ NORMAL HUMAN LOGIN:");
    const normalKeystrokes = [];
    const normalStart = Date.now();
    for (const char of password) {
        const dwell = 120 + Math.random() * 40;
        const pressTime = normalStart + normalKeystrokes.length * 200;
        normalKeystrokes.push({
            key: char,
            pressTime: Math.round(pressTime),
            releaseTime: Math.round(pressTime + dwell)
        });
    }
    await sendLogin(email, password, normalKeystrokes, "Human  ");
    
    // Wait 1 second
    await new Promise(r => setTimeout(r, 1000));
    
    // Superhuman Speed Bot
    console.log("\n2️⃣ SUPERHUMAN SPEED BOT:");
    for (let i = 1; i <= 3; i++) {
        const botKeystrokes = generateBotKeystrokes(password);
        await sendLogin(email, password, botKeystrokes, `Bot ${i}  `);
        await new Promise(r => setTimeout(r, 500));
    }
    
    // Paste Attack
    console.log("\n3️⃣ PASTE ATTACK (Auto-fill Tool):");
    for (let i = 1; i <= 2; i++) {
        const pasteKeystrokes = generatePasteAttack(password);
        await sendLogin(email, password, pasteKeystrokes, `Paste ${i}`);
        await new Promise(r => setTimeout(r, 500));
    }
    
    // Brute Force Tool
    console.log("\n4️⃣ BRUTE FORCE TOOL:");
    for (let i = 1; i <= 2; i++) {
        const bfKeystrokes = generateBruteForceBot(password);
        await sendLogin(email, password, bfKeystrokes, `Brute ${i}`);
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log("\n" + "═".repeat(65));
    console.log("✅ Simulation Complete!");
    console.log("🎯 BOT ATTACKS DETECTED with HIGH RISK scores!");
    console.log("\n💡 Check: http://localhost:3000/admin/cases");
    console.log("   Cases are auto-created for each attack!\n");
}

// Main
async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];
    
    if (!email || !password) {
        console.log("Usage: node scripts/botAttack.js <email> <password>");
        console.log("Example: node scripts/botAttack.js testcase@gmail.com Testcase@1");
        process.exit(1);
    }
    
    await runBotAttack(email, password);
}

main().catch(console.error);