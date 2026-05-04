/**
 * Advanced Attack Detection System
 * Detects credential stuffing, password spraying, session hijacking, and more
 */

class AdvancedAttackDetector {
    constructor() {
        // Known VPN/Tor IP ranges (simplified - use a real database in production)
        this.knownVPNRanges = [
            '103.', '104.', '143.', '146.',  // Common VPN ranges
            '185.220.', '23.129.',           // Tor exit nodes
        ];

        // Headless browser indicators
        this.headlessIndicators = [
            'HeadlessChrome', 'PhantomJS', 'Puppeteer',
            'Playwright', 'Selenium', 'WebDriver'
        ];

        // Tracking data (in production, use Redis)
        this.ipLoginCounts = new Map();
        this.passwordAttempts = new Map();
        this.sessionIPMap = new Map();
    }

    /**
     * Detect credential stuffing (same IP, many different accounts)
     */
    detectCredentialStuffing(ip, email, recentLogs) {
        const failuresFromIP = recentLogs.filter(log => 
            log.ipAddress === ip && log.status === 'failed'
        );

        const uniqueEmails = new Set(failuresFromIP.map(log => log.email));

        // Same IP trying many different accounts = credential stuffing
        if (uniqueEmails.size >= 5 && failuresFromIP.length >= 5) {
            return {
                detected: true,
                attackType: 'Credential Stuffing',
                confidence: 90,
                details: `${uniqueEmails.size} different accounts attempted from ${ip}`,
                riskScore: 80
            };
        }

        return { detected: false };
    }

    /**
     * Detect password spraying (same password, many accounts)
     */
    detectPasswordSpraying(ip, recentLogs) {
        const recentAttempts = recentLogs.filter(log =>
            new Date(log.createdAt) > Date.now() - 30 * 60 * 1000 // Last 30 minutes
        );

        const uniqueEmails = new Set(recentAttempts.map(log => log.email));

        // Many accounts, likely same password = password spraying
        if (uniqueEmails.size >= 3 && recentAttempts.length >= 5) {
            return {
                detected: true,
                attackType: 'Password Spraying',
                confidence: 75,
                details: `${uniqueEmails.size} accounts targeted from ${ip}`,
                riskScore: 70
            };
        }

        return { detected: false };
    }

    /**
     * Detect session hijacking (different IP, same session token)
     */
    detectSessionHijacking(currentIP, sessionId, userId) {
        const storedIP = this.sessionIPMap.get(sessionId);

        if (storedIP && storedIP !== currentIP) {
            // Same session, different IP = possible hijacking
            this.sessionIPMap.set(sessionId, currentIP);
            return {
                detected: true,
                attackType: 'Session Hijacking',
                confidence: 85,
                details: `Session ${sessionId} moved from ${storedIP} to ${currentIP}`,
                riskScore: 90
            };
        }

        this.sessionIPMap.set(sessionId, currentIP);
        return { detected: false };
    }

    /**
     * Detect MITM (Man-in-the-Middle) based on request timing
     */
    detectMITM(requestTiming, normalTiming = 200) {
        // MITM adds latency (2-3x normal)
        if (requestTiming > normalTiming * 2.5) {
            return {
                detected: true,
                attackType: 'Possible MITM',
                confidence: 40,
                details: `Request timing ${requestTiming}ms vs normal ${normalTiming}ms`,
                riskScore: 50
            };
        }

        return { detected: false };
    }

    /**
     * Detect VPN/Proxy based on IP range
     */
    detectVPNProxy(ip) {
        for (const range of this.knownVPNRanges) {
            if (ip.startsWith(range)) {
                return {
                    detected: true,
                    attackType: 'VPN/Proxy Detected',
                    confidence: 60,
                    details: `IP ${ip} matches known VPN/proxy range`,
                    riskScore: 40
                };
            }
        }

        return { detected: false };
    }

    /**
     * Detect headless browser (automation tool)
     */
    detectHeadlessBrowser(userAgent) {
        if (!userAgent) return { detected: false };

        for (const indicator of this.headlessIndicators) {
            if (userAgent.includes(indicator)) {
                return {
                    detected: true,
                    attackType: 'Headless Browser',
                    confidence: 90,
                    details: `User agent contains: ${indicator}`,
                    riskScore: 75
                };
            }
        }

        // Missing common browser headers
        if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
            return {
                detected: true,
                attackType: 'Suspicious User Agent',
                confidence: 50,
                details: 'User agent missing standard browser identifiers',
                riskScore: 35
            };
        }

        return { detected: false };
    }

    /**
     * Detect automated script (instant form fill, no human delays)
     */
    detectAutomatedScript(keystrokeData, formFillTime) {
        if (!keystrokeData || keystrokeData.length === 0) {
            // No keystrokes at all = script/paste
            if (formFillTime && formFillTime < 500) {
                return {
                    detected: true,
                    attackType: 'Automated Script',
                    confidence: 95,
                    details: 'Form filled in < 500ms with no keystroke data',
                    riskScore: 85
                };
            }
            return { detected: false };
        }

        // Check for perfectly uniform typing (script-like)
        if (keystrokeData.length >= 5) {
            const dwellTimes = keystrokeData.map(k => k.releaseTime - k.pressTime);
            const variance = this.calculateVariance(dwellTimes);

            if (variance < 5) { // Nearly zero variance = robot
                return {
                    detected: true,
                    attackType: 'Automated Script',
                    confidence: 88,
                    details: `Dwell time variance: ${variance.toFixed(2)}ms (suspiciously uniform)`,
                    riskScore: 70
                };
            }
        }

        return { detected: false };
    }

    /**
     * Detect rapid account creation (bot registration)
     */
    detectRapidAccountCreation(ip, recentRegistrations) {
        const recentFromIP = recentRegistrations.filter(reg =>
            reg.ip === ip &&
            new Date(reg.timestamp) > Date.now() - 60 * 60 * 1000 // Last hour
        );

        if (recentFromIP.length >= 5) {
            return {
                detected: true,
                attackType: 'Rapid Account Creation',
                confidence: 85,
                details: `${recentFromIP.length} accounts created in 1 hour from ${ip}`,
                riskScore: 75
            };
        }

        return { detected: false };
    }

    /**
     * Run ALL attack detections
     */
    runAllDetections(params) {
        const {
            ip,
            email,
            userAgent,
            keystrokeData,
            recentLogs = [],
            sessionId,
            userId,
            requestTiming,
            formFillTime,
            recentRegistrations = []
        } = params;

        const results = [];

        // Run all detectors
        results.push(this.detectCredentialStuffing(ip, email, recentLogs));
        results.push(this.detectPasswordSpraying(ip, recentLogs));
        results.push(this.detectVPNProxy(ip));
        results.push(this.detectHeadlessBrowser(userAgent));
        results.push(this.detectAutomatedScript(keystrokeData, formFillTime));
        results.push(this.detectRapidAccountCreation(ip, recentRegistrations));

        if (sessionId) {
            results.push(this.detectSessionHijacking(ip, sessionId, userId));
        }

        if (requestTiming) {
            results.push(this.detectMITM(requestTiming));
        }

        // Filter to only detected attacks
        const detectedAttacks = results.filter(r => r.detected);

        // Calculate combined risk from attacks
        const maxRiskScore = detectedAttacks.length > 0 ?
            Math.max(...detectedAttacks.map(a => a.riskScore)) : 0;

        return {
            totalDetectors: results.length,
            detectedAttacks: detectedAttacks,
            attackCount: detectedAttacks.length,
            additionalRisk: maxRiskScore,
            summary: detectedAttacks.map(a => a.attackType).join(', ') || 'No attacks detected'
        };
    }

    /**
     * Calculate variance of an array
     */
    calculateVariance(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    }

    /**
     * Reset tracking data (call periodically)
     */
    reset() {
        this.ipLoginCounts.clear();
        this.passwordAttempts.clear();
        this.sessionIPMap.clear();
    }
}

module.exports = new AdvancedAttackDetector();