/**
 * AI-Powered Phishing & Social Engineering Detection Shield
 * Analyzes messages for malicious patterns in real-time
 */

class PhishingShield {
    constructor() {
        // Social Engineering Patterns
        this.socialEngineeringPatterns = [
            {
                pattern: /urgent.*(action|response|verification)/i,
                weight: 30,
                category: 'Urgency Pressure',
                description: 'Message creates false urgency'
            },
            {
                pattern: /(account|password|login).*(suspended|locked|blocked|disabled)/i,
                weight: 35,
                category: 'Account Threat',
                description: 'False account security threat'
            },
            {
                pattern: /(click|open|download).*(link|attachment|file)/i,
                weight: 25,
                category: 'Malicious Link',
                description: 'Suspicious link/attachment request'
            },
            {
                pattern: /(verify|confirm|validate).*(identity|account|email)/i,
                weight: 30,
                category: 'Credential Harvesting',
                description: 'Attempt to steal credentials'
            },
            {
                pattern: /(i am|calling from|representing).*(support|security|admin|team)/i,
                weight: 35,
                category: 'Impersonation',
                description: 'Impersonating authority figure'
            },
            {
                pattern: /(reset|change|update).*(password|credentials|security)/i,
                weight: 25,
                category: 'Account Manipulation',
                description: 'Unauthorized account changes'
            },
            {
                pattern: /(send|provide|share).*(ssn|social security|credit card|bank|passport)/i,
                weight: 40,
                category: 'Sensitive Data Request',
                description: 'Requesting sensitive personal information'
            },
            {
                pattern: /(limited time|expires|deadline|offer ends)/i,
                weight: 20,
                category: 'Scarcity Tactic',
                description: 'Using scarcity to pressure action'
            },
            {
                pattern: /(you.*won|prize|reward|free.*claim)/i,
                weight: 25,
                category: 'Prize Scam',
                description: 'Fake prize/reward offer'
            },
            {
                pattern: /(invoice|payment|billing).*(attached|pending|overdue)/i,
                weight: 30,
                category: 'Fake Invoice',
                description: 'Malicious invoice/payment request'
            }
        ];

        // Prompt Injection Patterns
        this.promptInjectionPatterns = [
            {
                pattern: /(ignore|forget|disregard).*(previous|above|instructions|rules)/i,
                weight: 40,
                category: 'Instruction Override',
                description: 'Attempting to override bot instructions'
            },
            {
                pattern: /(you are now|act as|pretend to be|roleplay as)/i,
                weight: 35,
                category: 'Role Manipulation',
                description: 'Attempting to change bot identity'
            },
            {
                pattern: /(system prompt|internal instructions|tell me your)/i,
                weight: 40,
                category: 'System Extraction',
                description: 'Attempting to extract system prompts'
            },
            {
                pattern: /(\bdelete\b|\bdrop\b|\bremove\b).*(database|table|record|user)/i,
                weight: 45,
                category: 'Data Destruction',
                description: 'Attempting unauthorized data operations'
            },
            {
                pattern: /(sudo|admin|root|privilege|escalat)/i,
                weight: 35,
                category: 'Privilege Escalation',
                description: 'Attempting to gain elevated access'
            },
            {
                pattern: /(\bexec\b|\beval\b|\bsystem\b|\bexec\b).*\(/i,
                weight: 50,
                category: 'Code Injection',
                description: 'Attempting code execution'
            }
        ];

        // AI-generated phishing indicators (heuristic-based)
        this.aiIndicators = {
            emotionalManipulation: [
                'afraid', 'worried', 'scared', 'concerned', 'urgent', 'immediately',
                'critical', 'severe', 'serious', 'dangerous', 'threat', 'risk'
            ],
            trustBuilding: [
                'official', 'verified', 'authentic', 'legitimate', 'authorized',
                'trusted', 'secure', 'protected', 'certified', 'approved'
            ],
            pressureWords: [
                'now', 'quickly', 'fast', 'hurry', 'immediate', 'instant',
                'today', 'right away', 'asap', 'promptly'
            ]
        };
    }

    /**
     * Analyze a message for phishing/social engineering content
     * @param {string} text - The message to analyze
     * @param {Object} metadata - Additional context (sender, ip, etc.)
     * @returns {Object} Detailed analysis results
     */
    analyzeMessage(text, metadata = {}) {
        if (!text || text.trim().length === 0) {
            return {
                riskScore: 0,
                riskLevel: 'None',
                isSafe: true,
                action: 'allow',
                analysis: []
            };
        }

        const lowerText = text.toLowerCase();
        const findings = [];
        let totalScore = 0;

        // Check social engineering patterns
        this.socialEngineeringPatterns.forEach(rule => {
            if (rule.pattern.test(lowerText)) {
                findings.push({
                    type: 'social_engineering',
                    category: rule.category,
                    description: rule.description,
                    confidence: 'High',
                    score: rule.weight
                });
                totalScore += rule.weight;
            }
        });

        // Check prompt injection patterns
        this.promptInjectionPatterns.forEach(rule => {
            if (rule.pattern.test(lowerText)) {
                findings.push({
                    type: 'prompt_injection',
                    category: rule.category,
                    description: rule.description,
                    confidence: 'High',
                    score: rule.weight
                });
                totalScore += rule.weight;
            }
        });

        // 🆕 AI-Style Analysis: Emotional manipulation detection
        const emotionalScore = this.analyzeEmotionalContent(lowerText);
        if (emotionalScore > 0) {
            findings.push({
                type: 'ai_analysis',
                category: 'Emotional Manipulation',
                description: `Message contains ${emotionalScore} emotional manipulation indicators`,
                confidence: emotionalScore > 3 ? 'High' : 'Medium',
                score: emotionalScore * 10
            });
            totalScore += emotionalScore * 10;
        }

        // 🆕 AI-Style Analysis: Trust building word abuse
        const trustScore = this.analyzeTrustBuilding(lowerText);
        if (trustScore > 2) {
            findings.push({
                type: 'ai_analysis',
                category: 'Trust Manipulation',
                description: `Excessive trust-building language detected (${trustScore} indicators)`,
                confidence: 'Medium',
                score: trustScore * 8
            });
            totalScore += trustScore * 8;
        }

        // 🆕 Urgency scoring
        const urgencyScore = this.analyzeUrgency(lowerText);
        if (urgencyScore > 2) {
            findings.push({
                type: 'ai_analysis',
                category: 'Urgency Pressure',
                description: `High urgency language detected (${urgencyScore} indicators)`,
                confidence: 'Medium',
                score: urgencyScore * 7
            });
            totalScore += urgencyScore * 7;
        }

        // Check for link/URL presence
        const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
        if (urlCount > 2) {
            findings.push({
                type: 'content_analysis',
                category: 'Excessive Links',
                description: `Message contains ${urlCount} URLs`,
                confidence: 'Medium',
                score: urlCount * 10
            });
            totalScore += urlCount * 10;
        }

        // Cap total score at 100
        totalScore = Math.min(100, totalScore);

        // Determine risk level
        let riskLevel, action, isSafe;
        
        if (totalScore >= 70) {
            riskLevel = 'Critical';
            action = 'block';
            isSafe = false;
        } else if (totalScore >= 50) {
            riskLevel = 'High';
            action = 'block';
            isSafe = false;
        } else if (totalScore >= 30) {
            riskLevel = 'Medium';
            action = 'flag';
            isSafe = false;
        } else if (totalScore >= 15) {
            riskLevel = 'Low';
            action = 'monitor';
            isSafe = true;
        } else {
            riskLevel = 'Safe';
            action = 'allow';
            isSafe = true;
        }

        return {
            riskScore: totalScore,
            riskLevel,
            isSafe,
            action,
            findings,
            analysis: findings.map(f => f.description),
            recommendations: this.generateRecommendations(findings, totalScore),
            timestamp: new Date().toISOString(),
            metadata: {
                ...metadata,
                textLength: text.length,
                urlCount,
                analyzedBy: 'AI Phishing Shield v2.0'
            }
        };
    }

    /**
     * AI-Style: Detect emotional manipulation
     */
    analyzeEmotionalContent(text) {
        let score = 0;
        const words = text.split(/\s+/);
        
        this.aiIndicators.emotionalManipulation.forEach(word => {
            if (words.includes(word)) score += 1;
        });
        
        // Check for emotional punctuation patterns
        if ((text.match(/!/g) || []).length > 3) score += 2;
        if ((text.match(/\?/g) || []).length > 3) score += 1;
        
        return score;
    }

    /**
     * AI-Style: Detect trust-building manipulation
     */
    analyzeTrustBuilding(text) {
        let score = 0;
        
        this.aiIndicators.trustBuilding.forEach(word => {
            if (text.includes(word)) score += 1;
        });
        
        // Phrases like "we will never" or "this is secure" are suspicious
        if (/we (will )?never/i.test(text)) score += 2;
        if (/this is (completely|totally|100%)? (safe|secure)/i.test(text)) score += 2;
        
        return score;
    }

    /**
     * AI-Style: Measure urgency/pressure
     */
    analyzeUrgency(text) {
        let score = 0;
        
        this.aiIndicators.pressureWords.forEach(word => {
            if (text.includes(word)) score += 1;
        });
        
        // Time-based urgency
        if (/(\d+)\s*(minute|hour|day)s?\s*(left|remaining|to)/i.test(text)) score += 3;
        
        return score;
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(findings, totalScore) {
        const recommendations = [];

        if (totalScore >= 50) {
            recommendations.push('🚫 BLOCK: This message should be blocked immediately');
            recommendations.push('📋 Log the incident for security audit');
            recommendations.push('🔍 Investigate sender IP and origin');
        }

        if (findings.some(f => f.category === 'Credential Harvesting')) {
            recommendations.push('⚠️ Credential harvesting attempt detected - educate user');
        }

        if (findings.some(f => f.type === 'prompt_injection')) {
            recommendations.push('🛡️ Prompt injection attempt blocked');
            recommendations.push('Consider rate limiting this source');
        }

        if (findings.some(f => f.category === 'Emotional Manipulation')) {
            recommendations.push('🧠 Social engineering tactics detected - raise awareness');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ Message appears safe');
        }

        return recommendations;
    }

    /**
     * Analyze a conversation thread for escalating patterns
     */
    analyzeConversation(messages) {
        if (!messages || messages.length === 0) return null;

        const results = messages.map(msg => this.analyzeMessage(msg.text, msg.metadata));
        
        // Check for escalating risk
        const scores = results.map(r => r.riskScore);
        const isEscalating = scores.length >= 3 && 
            scores[scores.length - 1] > scores[0] + 15;
        
        // Check for pattern repetition (persistent attacker)
        const categories = new Set();
        results.forEach(r => r.findings.forEach(f => categories.add(f.category)));
        
        return {
            messageCount: messages.length,
            overallRisk: Math.max(...scores),
            isEscalating,
            uniqueCategories: categories.size,
            persistentThreat: categories.size >= 3,
            messages: results,
            summary: this.generateConversationSummary(results, isEscalating)
        };
    }

    /**
     * Generate conversation-level summary
     */
    generateConversationSummary(results, isEscalating) {
        if (isEscalating) {
            return '⚠️ Escalating threat pattern detected - conversation shows increasing risk';
        }
        
        const avgRisk = results.reduce((sum, r) => sum + r.riskScore, 0) / results.length;
        
        if (avgRisk > 50) {
            return '🔴 High-risk conversation - multiple phishing indicators';
        } else if (avgRisk > 25) {
            return '🟡 Moderate risk - monitor conversation';
        } else {
            return '🟢 Low risk conversation';
        }
    }

    /**
     * Quick scan for immediate threats (fast path)
     */
    quickScan(text) {
        const criticalPatterns = [
            /sudo/i,
            /<script/i,
            /DROP TABLE/i,
            /system\(/i,
            /eval\(/i,
            /prompt.*inject/i
        ];

        for (const pattern of criticalPatterns) {
            if (pattern.test(text)) {
                return {
                    isThreat: true,
                    reason: 'Critical threat pattern detected',
                    action: 'block'
                };
            }
        }

        return {
            isThreat: false,
            reason: 'No immediate threat',
            action: 'allow'
        };
    }
}

// Create singleton instance
const phishingShield = new PhishingShield();

module.exports = phishingShield;