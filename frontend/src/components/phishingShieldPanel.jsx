import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import axios from 'axios';

const PhishingShieldPanel = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const analyzeText = async () => {
        if (!text.trim()) return;
        
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/api/shield/analyze`, {
                text,
                metadata: {
                    source: 'shield_panel',
                    timestamp: new Date().toISOString()
                }
            });
            setResult(data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch(level) {
            case 'Safe': return 'bg-green-100 text-green-700 border-green-200';
            case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold">AI Phishing Shield</h3>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a suspicious message here to analyze..."
                className="w-full h-32 p-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />

            <button
                onClick={analyzeText}
                disabled={loading || !text.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-4"
            >
                {loading ? 'Analyzing...' : '🛡️ Analyze Message'}
            </button>

            {result && (
                <div className={`p-4 rounded-xl border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-lg">
                            {result.riskLevel} Risk
                        </span>
                        <span className="text-2xl font-bold">
                            {result.riskScore}/100
                        </span>
                    </div>

                    {result.findings?.length > 0 && (
                        <div className="space-y-2 mb-3">
                            <p className="font-medium text-sm">Findings:</p>
                            {result.findings.map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    {finding.confidence === 'High' ? 
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> :
                                        <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                                    }
                                    <div>
                                        <span className="font-medium">{finding.category}:</span>{' '}
                                        {finding.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {result.recommendations?.length > 0 && (
                        <div className="border-t pt-3">
                            <p className="font-medium text-sm mb-1">Recommendations:</p>
                            {result.recommendations.map((rec, idx) => (
                                <p key={idx} className="text-sm">{rec}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PhishingShieldPanel;