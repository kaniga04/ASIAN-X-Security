const express = require("express");
const router = express.Router();
const phishingShield = require("../utils/phishingShield");

/**
 * Analyze a single message
 */
router.post("/analyze", async (req, res) => {
    try {
        const { text, metadata } = req.body;

        if (!text) {
            return res.status(400).json({ 
                success: false, 
                message: "Text is required" 
            });
        }

        // Quick scan first
        const quickResult = phishingShield.quickScan(text);
        
        if (quickResult.isThreat) {
            return res.json({
                success: true,
                immediateAction: 'block',
                quickScan: quickResult,
                message: 'Critical threat detected - blocked immediately'
            });
        }

        // Full analysis
        const analysis = phishingShield.analyzeMessage(text, metadata);

        res.json({
            success: true,
            ...analysis
        });

    } catch (error) {
        console.error("Shield analysis error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Analysis failed" 
        });
    }
});

/**
 * Analyze a conversation
 */
router.post("/analyze-conversation", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                success: false, 
                message: "Messages array is required" 
            });
        }

        const analysis = phishingShield.analyzeConversation(messages);

        res.json({
            success: true,
            ...analysis
        });

    } catch (error) {
        console.error("Conversation analysis error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Analysis failed" 
        });
    }
});

/**
 * Quick threat check
 */
router.post("/quick-scan", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ 
                success: false, 
                message: "Text is required" 
            });
        }

        const result = phishingShield.quickScan(text);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Quick scan error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Scan failed" 
        });
    }
});

/**
 * Get shield statistics
 */
router.get("/stats", async (req, res) => {
    res.json({
        success: true,
        shield: {
            version: "2.0",
            type: "AI-Powered Phishing Shield",
            capabilities: [
                "Social Engineering Detection",
                "Prompt Injection Protection",
                "Emotional Manipulation Analysis",
                "Trust Building Detection",
                "Urgency Pressure Detection",
                "Conversation Pattern Analysis",
                "Real-time Threat Blocking"
            ],
            patterns: {
                socialEngineering: 10,
                promptInjection: 6,
                aiAnalysis: 3
            }
        }
    });
});

module.exports = router;