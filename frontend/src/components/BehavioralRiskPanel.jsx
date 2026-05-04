import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Shield, 
    AlertTriangle, 
    Activity, 
    Clock, 
    MapPin, 
    Monitor,
    User,
    ChevronDown,
    ChevronUp,
    Info,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const BehavioralRiskPanel = ({ loginLog, onClose, userProfile }) => {
    const [expandedSections, setExpandedSections] = useState({
        keystroke: true,
        travel: true,
        device: false,
        temporal: false
    });
    const [riskTrend, setRiskTrend] = useState(null);

    if (!loginLog) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-500 text-center">No login data available</p>
            </div>
        );
    }

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Get risk color based on score
    const getRiskColor = (score) => {
        if (score < 30) return 'text-green-600';
        if (score < 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRiskBg = (score) => {
        if (score < 30) return 'bg-green-100';
        if (score < 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getRiskBorder = (score) => {
        if (score < 30) return 'border-green-200';
        if (score < 60) return 'border-yellow-200';
        return 'border-red-200';
    };

    // Get risk level icon
    const getRiskIcon = (level) => {
        switch(level?.toLowerCase()) {
            case 'low':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'medium':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'high':
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    // Format duration
    const formatDuration = (ms) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    // Format distance
    const formatDistance = (km) => {
        if (!km) return 'N/A';
        if (km < 1) return `${(km * 1000).toFixed(0)}m`;
        return `${km.toFixed(1)}km`;
    };

    // Format speed
    const formatSpeed = (kmh) => {
        if (!kmh) return 'N/A';
        if (kmh > 1000) return `${(kmh / 1000).toFixed(1)} Mach`;
        return `${kmh.toFixed(0)} km/h`;
    };

    return (
        <div className="bg-white rounded-xl shadow-xl max-w-4xl mx-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Behavioral Risk Analysis
                    </h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Overall Risk Score */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRiskBg(loginLog.combinedRiskScore || loginLog.riskScore)}`}>
                            <span className={`text-2xl font-bold ${getRiskColor(loginLog.combinedRiskScore || loginLog.riskScore)}`}>
                                {loginLog.combinedRiskScore || loginLog.riskScore || 0}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-semibold text-gray-900">
                                    {loginLog.riskLevel || 'Unknown'} Risk
                                </span>
                                {getRiskIcon(loginLog.riskLevel)}
                            </div>
                            <p className="text-sm text-gray-600">
                                Login ID: {loginLog._id?.slice(-8) || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {new Date(loginLog.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {loginLog.isAnomaly && (
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            Anomaly Detected
                        </div>
                    )}
                </div>

                {/* Risk Progress Bar */}
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                                (loginLog.combinedRiskScore || 0) < 30 ? 'bg-green-500' :
                                (loginLog.combinedRiskScore || 0) < 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, loginLog.combinedRiskScore || loginLog.riskScore || 0)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low Risk</span>
                        <span>Medium Risk</span>
                        <span>High Risk</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Keystroke Analysis Section */}
                {loginLog.keystrokeAnalysis && (
                    <div className={`border rounded-lg overflow-hidden ${getRiskBorder(loginLog.keystrokeAnalysis.anomalyScore)}`}>
                        <button
                            onClick={() => toggleSection('keystroke')}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                <span className="font-medium text-gray-900">Typing Pattern Analysis</span>
                                {loginLog.keystrokeAnalysis.riskLevel && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBg(loginLog.keystrokeAnalysis.anomalyScore)} ${getRiskColor(loginLog.keystrokeAnalysis.anomalyScore)}`}>
                                        {loginLog.keystrokeAnalysis.riskLevel} Risk
                                    </span>
                                )}
                            </div>
                            {expandedSections.keystroke ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {expandedSections.keystroke && (
                            <div className="p-4 space-y-4">
                                {/* Anomaly Score */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Behavioral Anomaly Score</span>
                                        <span className="font-semibold">{loginLog.keystrokeAnalysis.anomalyScore?.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                loginLog.keystrokeAnalysis.anomalyScore < 30 ? 'bg-green-500' :
                                                loginLog.keystrokeAnalysis.anomalyScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${loginLog.keystrokeAnalysis.anomalyScore || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Pattern Deviation Details */}
                                {loginLog.keystrokeAnalysis.patternDeviation && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <span className="text-xs text-gray-500">Dwell Time Deviation</span>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {(loginLog.keystrokeAnalysis.patternDeviation.dwellDeviation * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Key hold duration variance
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <span className="text-xs text-gray-500">Flight Time Deviation</span>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {(loginLog.keystrokeAnalysis.patternDeviation.flightDeviation * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Key transition speed variance
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Raw Metrics */}
                                {loginLog.keystrokeAnalysis.rawMetrics && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Typing Metrics</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Avg Dwell Time:</span>
                                                <span className="font-medium">{formatDuration(loginLog.keystrokeAnalysis.rawMetrics.avgDwellTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Avg Flight Time:</span>
                                                <span className="font-medium">{formatDuration(loginLog.keystrokeAnalysis.rawMetrics.avgFlightTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Typing Time:</span>
                                                <span className="font-medium">{formatDuration(loginLog.keystrokeAnalysis.rawMetrics.totalTypingTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Typing Speed:</span>
                                                <span className="font-medium">{loginLog.keystrokeAnalysis.rawMetrics.typingSpeed?.toFixed(1)} keys/s</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Confidence */}
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-600">Confidence:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        loginLog.keystrokeAnalysis.confidence === 'High' ? 'bg-green-100 text-green-700' :
                                        loginLog.keystrokeAnalysis.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {loginLog.keystrokeAnalysis.confidence || 'Low'}
                                    </span>
                                    {loginLog.keystrokeAnalysis.comparedWithBaseline && (
                                        <span className="text-green-600 text-xs">✓ Compared with baseline</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Travel Analysis Section */}
                {loginLog.travelAnalysis && (
                    <div className={`border rounded-lg overflow-hidden ${loginLog.travelAnalysis.impossibleTravel ? 'border-red-200' : 'border-gray-200'}`}>
                        <button
                            onClick={() => toggleSection('travel')}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">Travel Analysis</span>
                                {loginLog.travelAnalysis.impossibleTravel && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                        Impossible Travel
                                    </span>
                                )}
                            </div>
                            {expandedSections.travel ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {expandedSections.travel && (
                            <div className="p-4 space-y-4">
                                {/* Travel Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <span className="text-xs text-gray-500 block mb-1">Distance</span>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {formatDistance(loginLog.travelAnalysis.distanceTraveled)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <span className="text-xs text-gray-500 block mb-1">Time Since Last</span>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {loginLog.travelAnalysis.timeSinceLastLogin?.toFixed(1)}h
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <span className="text-xs text-gray-500 block mb-1">Speed</span>
                                        <p className={`text-xl font-semibold ${loginLog.travelAnalysis.impossibleTravel ? 'text-red-600' : 'text-gray-900'}`}>
                                            {formatSpeed(loginLog.travelAnalysis.travelSpeed)}
                                        </p>
                                    </div>
                                </div>

                                {/* Previous Login Info */}
                                {loginLog.travelAnalysis.previousLogin && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Login</h4>
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Location:</span>
                                                <span className="font-medium">
                                                    {loginLog.travelAnalysis.previousLogin.location?.city || 'Unknown'}, 
                                                    {loginLog.travelAnalysis.previousLogin.location?.country || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium">
                                                    {new Date(loginLog.travelAnalysis.previousLogin.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Current Location */}
                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Login</h4>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">
                                                {loginLog.state || 'Unknown'}, {loginLog.country || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Coordinates:</span>
                                            <span className="font-medium">
                                                {loginLog.latitude?.toFixed(4)}, {loginLog.longitude?.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Flag Reasons */}
                                {loginLog.travelAnalysis.flagReasons?.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-red-800 mb-1">Travel Anomalies:</p>
                                        <ul className="list-disc list-inside text-sm text-red-700">
                                            {loginLog.travelAnalysis.flagReasons.map((reason, idx) => (
                                                <li key={idx}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Device Information */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('device')}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <Monitor className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">Device Information</span>
                        </div>
                        {expandedSections.device ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {expandedSections.device && (
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Device:</span>
                                    <span className="font-medium">{loginLog.device || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Browser:</span>
                                    <span className="font-medium">{loginLog.browser || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">OS:</span>
                                    <span className="font-medium">{loginLog.os || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Device ID:</span>
                                    <span className="font-medium text-xs font-mono">{loginLog.deviceId?.slice(0, 12)}...</span>
                                </div>
                            </div>

                            {/* Device Fingerprint */}
                            {loginLog.deviceFingerprint && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Device Fingerprint</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Platform:</span>
                                            <span>{loginLog.deviceFingerprint.platform || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Mobile:</span>
                                            <span>{loginLog.deviceFingerprint.isMobile ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tablet:</span>
                                            <span>{loginLog.deviceFingerprint.isTablet ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Desktop:</span>
                                            <span>{loginLog.deviceFingerprint.isDesktop ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Temporal Analysis */}
                {loginLog.temporalAnalysis && (
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection('temporal')}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-gray-900">Temporal Analysis</span>
                                {loginLog.temporalAnalysis.isUnusualTime && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                        Unusual Time
                                    </span>
                                )}
                            </div>
                            {expandedSections.temporal ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {expandedSections.temporal && (
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <span className="text-xs text-gray-500 block mb-1">Login Hour</span>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {loginLog.temporalAnalysis.loginHour}:00
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {loginLog.temporalAnalysis.loginHour < 6 ? 'Early Morning' :
                                             loginLog.temporalAnalysis.loginHour < 12 ? 'Morning' :
                                             loginLog.temporalAnalysis.loginHour < 18 ? 'Afternoon' : 'Evening'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <span className="text-xs text-gray-500 block mb-1">Login Day</span>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][loginLog.temporalAnalysis.loginDay]}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {loginLog.temporalAnalysis.loginDay === 0 || loginLog.temporalAnalysis.loginDay === 6 ? 'Weekend' : 'Weekday'}
                                        </p>
                                    </div>
                                </div>

                                {loginLog.temporalAnalysis.isUnusualTime && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ This login occurred outside the user's typical login hours.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Risk Components Breakdown */}
                {loginLog.riskComponents && (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50">
                            <h4 className="font-medium text-gray-900">Risk Components Breakdown</h4>
                        </div>
                        <div className="p-4 space-y-2">
                            {Object.entries(loginLog.riskComponents).map(([key, value]) => (
                                value.score > 0 && (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 capitalize">{key} Risk:</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        value.score < 30 ? 'bg-green-500' :
                                                        value.score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${value.score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8">{value.score}</span>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Threat Explanation */}
                {loginLog.threatExplanation && (
                    <div className={`border rounded-lg overflow-hidden ${
                        loginLog.threatExplanation.riskLevel === 'High' || loginLog.threatExplanation.riskLevel === 'Critical' 
                            ? 'border-red-200' : 'border-gray-200'
                    }`}>
                        <div className="px-4 py-3 bg-gray-50">
                            <h4 className="font-medium text-gray-900">
                                {loginLog.threatExplanation.title || 'Threat Analysis'}
                            </h4>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Reasons */}
                            {loginLog.threatExplanation.reasons?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
                                    <ul className="space-y-1">
                                        {loginLog.threatExplanation.reasons.map((reason, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recommendations */}
                            {loginLog.threatExplanation.recommendations?.length > 0 && (
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                                    <ul className="space-y-1">
                                        {loginLog.threatExplanation.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Mark as Safe
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    Report Attack
                </button>
            </div>
        </div>
    );
};

export default BehavioralRiskPanel;