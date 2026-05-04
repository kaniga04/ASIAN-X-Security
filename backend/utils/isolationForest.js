/**
 * Isolation Forest Algorithm for Anomaly Detection
 * "Isolates anomalies by randomly partitioning data"
 */

class IsolationForest {
    constructor() {
        this.trees = [];
        this.numTrees = 100;
        this.subSampleSize = 256;
        this.threshold = 0.6;
        this.isTrained = false;
    }

    train(normalSamples) {
        if (normalSamples.length < 5) {
            console.log(`⚠️ Need ${5 - normalSamples.length} more samples for Isolation Forest`);
            return false;
        }

        console.log(`🌲 Training Isolation Forest on ${normalSamples.length} samples...`);
        this.trees = [];

        for (let i = 0; i < this.numTrees; i++) {
            const sampleSize = Math.min(this.subSampleSize, normalSamples.length);
            const subSample = this.getRandomSubsample(normalSamples, sampleSize);
            const tree = this.buildTree(subSample, 0);
            this.trees.push(tree);
        }

        this.isTrained = true;
        
        const scores = normalSamples.map(s => this.predict(s));
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxNormalScore = Math.max(...scores);
        this.threshold = Math.min(0.7, maxNormalScore + 0.05);
        
        console.log(`✅ Isolation Forest trained - Trees: ${this.numTrees}, Threshold: ${this.threshold.toFixed(3)}`);
        console.log(`   Avg Score: ${avgScore.toFixed(3)}, Max Normal: ${maxNormalScore.toFixed(3)}`);
        return true;
    }

    buildTree(data, depth) {
        if (data.length <= 1 || depth >= Math.ceil(Math.log2(data.length))) {
            return { type: 'leaf', size: data.length, depth: depth };
        }

        const featureCount = data[0]?.length || 6;
        const featureIndex = Math.floor(Math.random() * featureCount);
        const values = data.map(d => d[featureIndex]).filter(v => !isNaN(v));
        
        if (values.length === 0) {
            return { type: 'leaf', size: data.length, depth: depth };
        }
        
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        
        if (minVal === maxVal) {
            return { type: 'leaf', size: data.length, depth: depth };
        }
        
        const splitValue = minVal + Math.random() * (maxVal - minVal);

        const left = data.filter(d => d[featureIndex] < splitValue);
        const right = data.filter(d => d[featureIndex] >= splitValue);

        return {
            type: 'node',
            featureIndex,
            splitValue,
            left: this.buildTree(left, depth + 1),
            right: this.buildTree(right, depth + 1)
        };
    }

    getRandomSubsample(data, size) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(size, data.length));
    }

    predict(features) {
        if (!this.isTrained || this.trees.length === 0) return 0;

        let totalPathLength = 0;
        for (const tree of this.trees) {
            totalPathLength += this.pathLength(features, tree, 0);
        }

        const avgPathLength = totalPathLength / this.trees.length;
        const n = this.subSampleSize;
        const c = this.expectedPathLength(n);
        return Math.pow(2, -avgPathLength / c);
    }

    pathLength(point, tree, currentDepth) {
        if (tree.type === 'leaf') {
            return currentDepth + this.cFactor(tree.size);
        }

        if (point[tree.featureIndex] < tree.splitValue) {
            return this.pathLength(point, tree.left, currentDepth + 1);
        } else {
            return this.pathLength(point, tree.right, currentDepth + 1);
        }
    }

    cFactor(size) {
        if (size <= 1) return 0;
        return 2 * (Math.log(size - 1) + 0.5772156649) - (2 * (size - 1) / size);
    }

    expectedPathLength(n) {
        if (n <= 1) return 0;
        return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
    }

    isAnomaly(features) {
        const score = this.predict(features);
        const isAnomalous = score > this.threshold;
        return {
            score: Math.round(score * 100),
            isAnomaly: isAnomalous,
            threshold: Math.round(this.threshold * 100),
            reason: isAnomalous ? 
                `Isolation Forest: Anomaly detected (${Math.round(score * 100)}%)` :
                `Normal pattern (${Math.round(score * 100)}%)`
        };
    }

    exportModel() {
        return {
            trees: this.trees,
            threshold: this.threshold,
            numTrees: this.numTrees,
            isTrained: this.isTrained
        };
    }

    importModel(model) {
        if (!model) return false;
        this.trees = model.trees || [];
        this.threshold = model.threshold || 0.6;
        this.numTrees = model.numTrees || 100;
        this.isTrained = model.isTrained || false;
        return true;
    }
}

module.exports = new IsolationForest();