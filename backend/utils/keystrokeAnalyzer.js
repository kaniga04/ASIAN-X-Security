/**
 * Enhanced Keystroke Dynamics Analyzer with ML-style Training
 * Analyzes typing patterns for behavioral biometric authentication
 */

class KeystrokeAnalyzer {
    constructor() {
        // Thresholds for anomaly detection
        this.MIN_SAMPLES_FOR_PROFILE = 5;
        this.MIN_SAMPLES_FOR_HIGH_CONFIDENCE = 15;
        
        // Z-score thresholds
        this.ZSCORE_THRESHOLDS = {
            LOW: 1.0,      // < 1.0 std dev = normal
            MEDIUM: 2.0,   // 1.0-2.0 std dev = suspicious
            HIGH: 3.0      // > 3.0 std dev = highly anomalous
        };
        
        // Weight factors for combined score
        this.WEIGHTS = {
            dwell: 0.6,     // Dwell time is more stable
            flight: 0.4     // Flight time has more variance
        };
    }

    /**
     * Process raw keystroke data from frontend
     * @param {Array} keyEvents - Array of {key, pressTime, releaseTime}
     * @returns {Object} Processed keystroke signature
     */
    processKeystrokes(keyEvents) {
        if (!keyEvents || keyEvents.length < 2) {
            return { valid: false, reason: 'Insufficient keystroke data' };
        }

        const signature = {
            dwellTimes: [],
            flightTimes: [],
            totalTypingTime: 0,
            keySequence: '',
            keyCount: 0,
            timestamp: new Date()
        };

        // Calculate dwell times (hold duration)
        keyEvents.forEach(event => {
            const dwell = event.releaseTime - event.pressTime;
            signature.dwellTimes.push({
                key: event.key,
                duration: dwell
            });
            signature.keySequence += event.key;
        });

        // Calculate flight times (time between releasing one key and pressing next)
        for (let i = 0; i < keyEvents.length - 1; i++) {
            const flight = keyEvents[i + 1].pressTime - keyEvents[i].releaseTime;
            signature.flightTimes.push({
                from: keyEvents[i].key,
                to: keyEvents[i + 1].key,
                duration: flight
            });
        }

        // Calculate aggregate metrics
        signature.totalTypingTime = 
            keyEvents[keyEvents.length - 1].releaseTime - keyEvents[0].pressTime;
        signature.keyCount = keyEvents.length;
        
        // Calculate averages
        signature.avgDwellTime = signature.dwellTimes.length > 0 ?
            signature.dwellTimes.reduce((sum, d) => sum + d.duration, 0) / signature.dwellTimes.length : 0;
            
        signature.avgFlightTime = signature.flightTimes.length > 0 ?
            signature.flightTimes.reduce((sum, f) => sum + f.duration, 0) / signature.flightTimes.length : 0;
        
        // Typing speed (keys per second)
        signature.typingSpeed = signature.totalTypingTime > 0 ?
            (signature.keyCount / (signature.totalTypingTime / 1000)) : 0;

        // Generate privacy-preserving hash
        signature.signatureHash = this.generateSignatureHash(signature);

        return {
            valid: true,
            signature: signature
        };
    }

    /**
     * Train/Update user's behavioral model
     * @param {Array} historicalSignatures - User's past typing signatures
     * @returns {Object} Trained model with statistics
     */
    trainModel(historicalSignatures) {
        if (!historicalSignatures || historicalSignatures.length === 0) {
            return null;
        }

        // Extract all dwell and flight durations
        const allDwellTimes = [];
        const allFlightTimes = [];
        const typingSpeeds = [];

        historicalSignatures.forEach(sig => {
            if (sig.dwellTimes) {
                sig.dwellTimes.forEach(d => allDwellTimes.push(d.duration));
            }
            if (sig.flightTimes) {
                sig.flightTimes.forEach(f => allFlightTimes.push(f.duration));
            }
            if (sig.typingSpeed) {
                typingSpeeds.push(sig.typingSpeed);
            }
        });

        // Calculate statistics for dwell times
        const dwellStats = this.calculateStatistics(allDwellTimes);
        const flightStats = this.calculateStatistics(allFlightTimes);
        const speedStats = this.calculateStatistics(typingSpeeds);

        // Calculate confidence based on sample size and consistency
        const sampleSize = historicalSignatures.length;
        const consistencyScore = this.calculateConsistencyScore(historicalSignatures);
        
        let confidence = 0;
        if (sampleSize >= this.MIN_SAMPLES_FOR_HIGH_CONFIDENCE) {
            confidence = Math.min(0.95, 0.7 + (consistencyScore * 0.25));
        } else if (sampleSize >= this.MIN_SAMPLES_FOR_PROFILE) {
            confidence = Math.min(0.7, 0.4 + (consistencyScore * 0.2));
        } else {
            confidence = Math.min(0.4, sampleSize * 0.08);
        }

        return {
            dwell: dwellStats,
            flight: flightStats,
            speed: speedStats,
            sampleSize: sampleSize,
            confidence: confidence,
            consistencyScore: consistencyScore,
            isReliable: sampleSize >= this.MIN_SAMPLES_FOR_PROFILE && consistencyScore > 0.6,
            lastUpdated: new Date(),
            trainingStatus: this.getTrainingStatus(sampleSize, consistencyScore)
        };
    }

    /**
     * Calculate statistical measures (mean, std dev, min, max)
     */
    calculateStatistics(values) {
        if (!values || values.length === 0) {
            return { mean: 0, stdDev: 0, min: 0, max: 0, count: 0 };
        }

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        
        // Standard deviation
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Outlier detection (values beyond 2.5 std dev)
        const outliers = values.filter(v => Math.abs(v - mean) > 2.5 * stdDev);
        
        return {
            mean: Math.round(mean * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
            outlierCount: outliers.length,
            outlierPercentage: (outliers.length / values.length) * 100
        };
    }

    /**
     * Calculate consistency score of historical signatures
     */
    calculateConsistencyScore(historicalSignatures) {
        if (historicalSignatures.length < 3) return 0.5;
        
        const dwellMeans = historicalSignatures.map(s => s.avgDwellTime || 0);
        const flightMeans = historicalSignatures.map(s => s.avgFlightTime || 0);
        
        const dwellCV = this.calculateStatistics(dwellMeans).stdDev / 
                       (this.calculateStatistics(dwellMeans).mean || 1);
        const flightCV = this.calculateStatistics(flightMeans).stdDev / 
                        (this.calculateStatistics(flightMeans).mean || 1);
        
        // Lower coefficient of variation = more consistent
        const consistency = 1 - Math.min(1, (dwellCV + flightCV) / 2);
        
        return Math.round(consistency * 100) / 100;
    }

    /**
     * Get training status description
     */
    getTrainingStatus(sampleSize, consistencyScore) {
        if (sampleSize < this.MIN_SAMPLES_FOR_PROFILE) {
            return {
                level: 'Learning',
                description: `Building baseline (${sampleSize}/${this.MIN_SAMPLES_FOR_PROFILE} samples)`,
                progress: (sampleSize / this.MIN_SAMPLES_FOR_PROFILE) * 100
            };
        } else if (sampleSize < this.MIN_SAMPLES_FOR_HIGH_CONFIDENCE) {
            return {
                level: 'Established',
                description: `Baseline established (${sampleSize} samples)`,
                progress: 70
            };
        } else if (consistencyScore > 0.8) {
            return {
                level: 'Highly Reliable',
                description: `Strong behavioral profile (${sampleSize} samples)`,
                progress: 100
            };
        } else {
            return {
                level: 'Reliable',
                description: `Behavioral profile active (${sampleSize} samples)`,
                progress: 85
            };
        }
    }

    /**
     * Compare current typing pattern with trained model
     * @param {Object} currentSignature - Current typing signature
     * @param {Object} model - Trained behavioral model
     * @returns {Object} Detailed anomaly analysis
     */
    compareWithModel(currentSignature, model) {
        if (!model || !model.isReliable) {
            return {
                anomalyScore: 0,
                riskLevel: 'Unknown',
                confidence: 'Low',
                reason: 'Insufficient training data for behavioral model',
                requiresMoreData: true
            };
        }

        // Calculate Z-scores
        const dwellZScore = model.dwell.stdDev > 0 ?
            Math.abs(currentSignature.avgDwellTime - model.dwell.mean) / model.dwell.stdDev : 0;
            
        const flightZScore = model.flight.stdDev > 0 ?
            Math.abs(currentSignature.avgFlightTime - model.flight.mean) / model.flight.stdDev : 0;
            
        const speedZScore = model.speed.stdDev > 0 ?
            Math.abs(currentSignature.typingSpeed - model.speed.mean) / model.speed.stdDev : 0;

        // Weighted anomaly score (0-100)
        const weightedZScore = (dwellZScore * this.WEIGHTS.dwell) + 
                              (flightZScore * this.WEIGHTS.flight);
        
        // Convert to 0-100 scale (3 std dev = 100%)
        let anomalyScore = Math.min(100, (weightedZScore / 3) * 100);
        
        // Adjust by model confidence (less confident = lower anomaly threshold)
        anomalyScore = anomalyScore * (1 + (1 - model.confidence) * 0.3);
        anomalyScore = Math.min(100, Math.round(anomalyScore * 100) / 100);

        // Determine risk level
        let riskLevel = 'Low';
        if (weightedZScore > this.ZSCORE_THRESHOLDS.HIGH) {
            riskLevel = 'High';
        } else if (weightedZScore > this.ZSCORE_THRESHOLDS.MEDIUM) {
            riskLevel = 'Medium';
        }

        // Generate anomaly reasons
        const reasons = [];
        if (dwellZScore > this.ZSCORE_THRESHOLDS.MEDIUM) {
            const direction = currentSignature.avgDwellTime > model.dwell.mean ? 'slower' : 'faster';
            reasons.push(`Key hold duration ${dwellZScore.toFixed(1)}x ${direction} than normal`);
        }
        if (flightZScore > this.ZSCORE_THRESHOLDS.MEDIUM) {
            const direction = currentSignature.avgFlightTime > model.flight.mean ? 'slower' : 'faster';
            reasons.push(`Key transition speed ${flightZScore.toFixed(1)}x ${direction} than normal`);
        }
        if (speedZScore > this.ZSCORE_THRESHOLDS.MEDIUM) {
            reasons.push(`Overall typing speed significantly different from baseline`);
        }

        // Confidence assessment
        let confidenceLevel = 'High';
        if (model.confidence < 0.5) confidenceLevel = 'Low';
        else if (model.confidence < 0.7) confidenceLevel = 'Medium';

        return {
            anomalyScore: anomalyScore,
            riskLevel: riskLevel,
            confidence: confidenceLevel,
            zScores: {
                dwell: Math.round(dwellZScore * 100) / 100,
                flight: Math.round(flightZScore * 100) / 100,
                speed: Math.round(speedZScore * 100) / 100,
                combined: Math.round(weightedZScore * 100) / 100
            },
            deviations: {
                dwellDeviation: model.dwell.mean > 0 ? 
                    Math.abs(currentSignature.avgDwellTime - model.dwell.mean) / model.dwell.mean : 0,
                flightDeviation: model.flight.mean > 0 ? 
                    Math.abs(currentSignature.avgFlightTime - model.flight.mean) / model.flight.mean : 0
            },
            reasons: reasons,
            modelConfidence: model.confidence,
            trainingStatus: model.trainingStatus,
            requiresMoreData: false
        };
    }

    /**
     * Legacy method for backward compatibility
     */
    comparePatterns(currentSignature, historicalSignatures = []) {
        if (!historicalSignatures || historicalSignatures.length < this.MIN_SAMPLES_FOR_PROFILE) {
            return {
                anomalyScore: 0,
                riskLevel: 'Unknown',
                confidence: 'Low',
                reason: `Insufficient historical data (${historicalSignatures.length}/${this.MIN_SAMPLES_FOR_PROFILE} samples)`,
                requiresMoreData: true
            };
        }

        const model = this.trainModel(historicalSignatures);
        return this.compareWithModel(currentSignature, model);
    }

    /**
     * Generate privacy-preserving hash of typing signature
     */
    generateSignatureHash(signature) {
        const crypto = require('crypto');
        const data = JSON.stringify({
            dwellPattern: signature.dwellTimes.map(d => Math.round(d.duration / 10) * 10),
            flightPattern: signature.flightTimes.map(f => Math.round(f.duration / 10) * 10),
            sequence: signature.keySequence,
            totalTime: Math.round(signature.totalTypingTime / 100) * 100
        });
        
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Check for impossible travel between two login locations
     */
    checkImpossibleTravel(prevLogin, currentLogin) {
        if (!prevLogin || !prevLogin.location || !currentLogin.location) {
            return { possible: true, reason: 'Insufficient location data' };
        }

        const distance = this.calculateDistance(
            prevLogin.location.latitude,
            prevLogin.location.longitude,
            currentLogin.location.latitude,
            currentLogin.location.longitude
        );

        const timeDiffHours = (new Date(currentLogin.timestamp) - new Date(prevLogin.timestamp)) 
            / (1000 * 60 * 60);

        const MAX_SPEED_KMH = 1000;
        const requiredHours = distance / MAX_SPEED_KMH;
        const isPossible = timeDiffHours >= requiredHours;

        return {
            possible: isPossible,
            distance: Math.round(distance * 100) / 100,
            timeDiffHours: Math.round(timeDiffHours * 100) / 100,
            requiredHours: Math.round(requiredHours * 100) / 100,
            speedRequired: timeDiffHours > 0 ? Math.round(distance / timeDiffHours) : Infinity,
            reason: isPossible ? 'Travel time sufficient' : 
                `Impossible travel: ${Math.round(distance)}km in ${Math.round(timeDiffHours)}h requires ${Math.round(distance/timeDiffHours)}km/h`
        };
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
}

module.exports = new KeystrokeAnalyzer();