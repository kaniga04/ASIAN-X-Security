/**
 * Pure JavaScript Behavioral DNA - Neural Network from Scratch
 * No native dependencies - Works on any Node.js version!
 */

class BehavioralDNA {
    constructor() {
        // Network architecture
        this.inputSize = 6;      // [avgDwell, stdDwell, avgFlight, stdFlight, typingSpeed, keyCount]
        this.hiddenSize = 8;
        this.outputSize = 1;
        
        // Weights (Xavier initialization)
        this.weightsIH = this.initializeWeights(this.inputSize, this.hiddenSize);
        this.weightsHO = this.initializeWeights(this.hiddenSize, this.outputSize);
        
        // Biases
        this.biasH = new Array(this.hiddenSize).fill(0);
        this.biasO = new Array(this.outputSize).fill(0);
        
        // Training state
        this.isTrained = false;
        this.trainingSamples = 0;
        this.learningRate = 0.01;
        this.epochs = 100;
        
        // User baseline storage
        this.baseline = null;
        this.threshold = 0.85;
    }

    /**
     * Xavier/Glorot weight initialization
     */
    initializeWeights(rows, cols) {
        const scale = Math.sqrt(2.0 / (rows + cols));
        return Array(rows).fill().map(() => 
            Array(cols).fill().map(() => (Math.random() * 2 - 1) * scale)
        );
    }

    /**
     * Sigmoid activation function
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Sigmoid derivative for backpropagation
     */
    sigmoidDerivative(x) {
        return x * (1 - x);
    }

    /**
     * ReLU activation
     */
    relu(x) {
        return Math.max(0, x);
    }

    /**
     * ReLU derivative
     */
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    /**
     * Forward pass through the network
     */
    forward(input) {
        // Input to Hidden
        this.hiddenInput = new Array(this.hiddenSize).fill(0);
        this.hiddenOutput = new Array(this.hiddenSize).fill(0);
        
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.biasH[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weightsIH[j][i];
            }
            this.hiddenInput[i] = sum;
            this.hiddenOutput[i] = this.relu(sum);
        }
        
        // Hidden to Output
        this.outputInput = this.biasO[0];
        for (let i = 0; i < this.hiddenSize; i++) {
            this.outputInput += this.hiddenOutput[i] * this.weightsHO[i][0];
        }
        this.output = this.sigmoid(this.outputInput);
        
        return this.output;
    }

    /**
     * Backward pass (backpropagation)
     */
    backward(input, target) {
        // Output layer error
        const outputError = target - this.output;
        const outputDelta = outputError * this.sigmoidDerivative(this.output);
        
        // Hidden layer error
        const hiddenError = new Array(this.hiddenSize).fill(0);
        const hiddenDelta = new Array(this.hiddenSize).fill(0);
        
        for (let i = 0; i < this.hiddenSize; i++) {
            hiddenError[i] = outputDelta * this.weightsHO[i][0];
            hiddenDelta[i] = hiddenError[i] * this.reluDerivative(this.hiddenOutput[i]);
        }
        
        // Update weights (Hidden to Output)
        for (let i = 0; i < this.hiddenSize; i++) {
            this.weightsHO[i][0] += this.learningRate * outputDelta * this.hiddenOutput[i];
        }
        this.biasO[0] += this.learningRate * outputDelta;
        
        // Update weights (Input to Hidden)
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsIH[i][j] += this.learningRate * hiddenDelta[j] * input[i];
            }
        }
        
        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasH[i] += this.learningRate * hiddenDelta[i];
        }
    }

    /**
     * Extract features from keystroke signature
     */
    extractFeatures(signature) {
        if (!signature) return null;
        
        const features = [];
        
        // Dwell time statistics
        const dwellTimes = signature.dwellTimes?.map(d => d.duration) || [];
        const avgDwell = dwellTimes.length > 0 ? 
            dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length : 0;
        const stdDwell = this.calculateStdDev(dwellTimes, avgDwell);
        
        // Flight time statistics
        const flightTimes = signature.flightTimes?.map(f => f.duration) || [];
        const avgFlight = flightTimes.length > 0 ? 
            flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length : 0;
        const stdFlight = this.calculateStdDev(flightTimes, avgFlight);
        
        // Normalize features to [0, 1] range
        features.push(Math.min(avgDwell / 500, 1));        // Max 500ms dwell
        features.push(Math.min(stdDwell / 200, 1));        // Max 200ms std dev
        features.push(Math.min(avgFlight / 1000, 1));      // Max 1000ms flight
        features.push(Math.min(stdFlight / 400, 1));       // Max 400ms std dev
        features.push(Math.min(signature.typingSpeed / 10, 1) || 0.5); // Max 10 keys/sec
        features.push(Math.min(signature.keyCount / 30, 1) || 0.5);    // Max 30 keys
        
        return features;
    }

    /**
     * Calculate standard deviation
     */
    calculateStdDev(values, mean) {
        if (values.length === 0) return 0;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    /**
     * Calculate baseline statistics from user signatures
     */
    calculateBaseline(signatures) {
        if (!signatures || signatures.length === 0) return null;
        
        const allFeatures = signatures.map(s => this.extractFeatures(s)).filter(f => f !== null);
        if (allFeatures.length === 0) return null;
        
        // Calculate mean feature vector
        const baseline = new Array(this.inputSize).fill(0);
        for (const features of allFeatures) {
            for (let i = 0; i < this.inputSize; i++) {
                baseline[i] += features[i];
            }
        }
        for (let i = 0; i < this.inputSize; i++) {
            baseline[i] /= allFeatures.length;
        }
        
        // Calculate standard deviation for threshold
        const distances = allFeatures.map(f => this.euclideanDistance(f, baseline));
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const stdDistance = this.calculateStdDev(distances, avgDistance);
        
        this.baseline = baseline;
        this.threshold = Math.max(0.7, Math.min(0.9, 1 - (avgDistance + stdDistance * 2)));
        this.trainingSamples = signatures.length;
        
        console.log(`📊 Baseline calculated - Threshold: ${this.threshold.toFixed(3)}, Samples: ${this.trainingSamples}`);
        
        return baseline;
    }

    /**
     * Euclidean distance between two vectors
     */
    euclideanDistance(vec1, vec2) {
        let sum = 0;
        for (let i = 0; i < vec1.length; i++) {
            sum += Math.pow(vec1[i] - vec2[i], 2);
        }
        return Math.sqrt(sum);
    }

    /**
     * Cosine similarity between two vectors
     */
    cosineSimilarity(vec1, vec2) {
        let dot = 0, norm1 = 0, norm2 = 0;
        for (let i = 0; i < vec1.length; i++) {
            dot += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2) || 1);
    }

    /**
     * Train on user's historical keystrokes
     */
    async trainOnUserData(userSignatures) {
        if (userSignatures.length < 5) {
            console.log(`⚠️ Need ${5 - userSignatures.length} more samples to train DNA model`);
            return false;
        }
        
        console.log(`🧬 Training Behavioral DNA on ${userSignatures.length} samples...`);
        
        // Calculate statistical baseline
        this.calculateBaseline(userSignatures);
        
        // Extract features for training
        const trainingData = userSignatures
            .map(s => this.extractFeatures(s))
            .filter(f => f !== null);
        
        if (trainingData.length < 5) {
            console.log('⚠️ Insufficient valid training data');
            return false;
        }
        
        // Train neural network
        let totalError = 0;
        
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            let epochError = 0;
            
            for (const features of trainingData) {
                // Forward pass
                const output = this.forward(features);
                
                // Target is 1 (genuine user)
                epochError += Math.pow(1 - output, 2);
                
                // Backward pass
                this.backward(features, 1);
            }
            
            epochError /= trainingData.length;
            totalError = epochError;
            
            if (epoch % 20 === 0) {
                console.log(`  Epoch ${epoch}: Error = ${epochError.toFixed(4)}`);
            }
        }
        
        this.isTrained = true;
        console.log(`✅ DNA Model Trained - Final Error: ${totalError.toFixed(4)}, Samples: ${this.trainingSamples}`);
        
        return true;
    }

    /**
     * Verify if current typing matches user's DNA
     */
    verifyUser(currentSignature) {
        if (!this.isTrained || !this.baseline) {
            return {
                isGenuine: true,
                confidence: 0,
                similarity: 0,
                anomalyScore: 0,
                riskLevel: 'Low',
                reason: 'DNA model not yet trained'
            };
        }
        
        const features = this.extractFeatures(currentSignature);
        if (!features) {
            return {
                isGenuine: true,
                confidence: 0,
                similarity: 0,
                anomalyScore: 0,
                riskLevel: 'Low',
                reason: 'Insufficient keystroke data'
            };
        }
        
        // Neural network prediction
        const nnOutput = this.forward(features);
        
        // Statistical similarity
        const cosineSim = this.cosineSimilarity(features, this.baseline);
        const euclideanDist = this.euclideanDistance(features, this.baseline);
        const normalizedDist = Math.min(euclideanDist / 2, 1);
        const statSimilarity = 1 - normalizedDist;
        
        // Combined similarity (weighted average)
        const similarity = (nnOutput * 0.6 + cosineSim * 0.2 + statSimilarity * 0.2);
        
        const anomalyScore = Math.round((1 - similarity) * 100);
        const isGenuine = similarity >= this.threshold;
        
        let riskLevel = 'Low';
        if (anomalyScore >= 70) riskLevel = 'High';
        else if (anomalyScore >= 40) riskLevel = 'Medium';
        
        return {
            isGenuine,
            confidence: Math.round(nnOutput * 100),
            similarity: Math.round(similarity * 100),
            anomalyScore,
            riskLevel,
            threshold: Math.round(this.threshold * 100),
            details: {
                nnConfidence: Math.round(nnOutput * 100),
                cosineSimilarity: Math.round(cosineSim * 100),
                statisticalSimilarity: Math.round(statSimilarity * 100)
            },
            reason: isGenuine ? 
                `Typing pattern matches user DNA (${Math.round(similarity * 100)}% similar)` : 
                `Behavioral DNA mismatch detected (${anomalyScore}% deviation)`
        };
    }

    /**
     * Export model to JSON
     */
    exportModel() {
        return {
            weightsIH: this.weightsIH,
            weightsHO: this.weightsHO,
            biasH: this.biasH,
            biasO: this.biasO,
            baseline: this.baseline,
            threshold: this.threshold,
            trainingSamples: this.trainingSamples,
            isTrained: this.isTrained
        };
    }

    /**
     * Import model from JSON
     */
    importModel(modelJSON) {
        if (!modelJSON) return false;
        try {
            this.weightsIH = modelJSON.weightsIH;
            this.weightsHO = modelJSON.weightsHO;
            this.biasH = modelJSON.biasH;
            this.biasO = modelJSON.biasO;
            this.baseline = modelJSON.baseline;
            this.threshold = modelJSON.threshold || 0.85;
            this.trainingSamples = modelJSON.trainingSamples || 0;
            this.isTrained = modelJSON.isTrained || false;
            console.log('✅ DNA Model loaded');
            return true;
        } catch (error) {
            console.error('Failed to load model:', error.message);
            return false;
        }
    }

    /**
     * Get training status
     */
    getTrainingStatus() {
        return {
            isTrained: this.isTrained,
            trainingSamples: this.trainingSamples,
            minRequired: 5,
            progress: Math.min(100, (this.trainingSamples / 5) * 100),
            readyForVerification: this.trainingSamples >= 5,
            threshold: Math.round(this.threshold * 100)
        };
    }
}

// Create singleton instance
const behavioralDNA = new BehavioralDNA();

module.exports = behavioralDNA;