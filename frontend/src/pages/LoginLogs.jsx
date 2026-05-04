import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  Shield, 
  AlertTriangle, 
  Key,
  Plane
} from "lucide-react";

function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://asian-x-security.onrender.com";

  /* ================= FETCH LOGS ================= */
  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/logs`);
      const sortedLogs = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLogs(sortedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  /* ================= DEVICE LABEL ================= */
  const getDeviceLabel = (deviceId) => {
    if (!deviceId || deviceId === "unknown-device") return "Unknown Device";
    return deviceId.slice(0, 12) + "...";
  };

  /* ================= GET RISK BADGE ================= */
  const getRiskBadge = (score) => {
    if (score >= 70) return { color: "bg-red-100 text-red-700", label: "High" };
    else if (score >= 40) return { color: "bg-yellow-100 text-yellow-700", label: "Medium" };
    else return { color: "bg-green-100 text-green-700", label: "Low" };
  };

  /* ================= FILTER LOGS ================= */
  const filteredLogs = logs.filter(log => {
    if (filter === "high" && log.riskScore < 70) return false;
    if (filter === "medium" && (log.riskScore < 40 || log.riskScore >= 70)) return false;
    if (filter === "low" && log.riskScore >= 40) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.email?.toLowerCase().includes(term) ||
        log.ipAddress?.toLowerCase().includes(term) ||
        log.deviceId?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  /* ================= STATS ================= */
  const stats = {
    total: logs.length,
    high: logs.filter(l => l.riskScore >= 70).length,
    medium: logs.filter(l => l.riskScore >= 40 && l.riskScore < 70).length,
    low: logs.filter(l => l.riskScore < 40).length,
    anomalies: logs.filter(l => l.isAnomaly).length,
    behavioralAnomalies: logs.filter(l => l.keystrokeAnalysis?.anomalyScore > 40).length,
    travelAnomalies: logs.filter(l => l.travelAnalysis?.impossibleTravel).length
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Login Activity Logs</h2>
              <p className="text-sm text-gray-500 mt-1">Comprehensive security event monitoring</p>
            </div>
            <button onClick={fetchLogs} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
              🔄 Refresh
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-red-600">High Risk</p>
              <p className="text-2xl font-bold text-red-700">{stats.high}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-yellow-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.medium}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600">Low</p>
              <p className="text-2xl font-bold text-green-700">{stats.low}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-purple-600">Anomalies</p>
              <p className="text-2xl font-bold text-purple-700">{stats.anomalies}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-indigo-600">Behavioral</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.behavioralAnomalies}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-orange-600">Travel</p>
              <p className="text-2xl font-bold text-orange-700">{stats.travelAnomalies}</p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex gap-4 mb-4">
            <div className="flex gap-2">
              {["all", "high", "medium", "low"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    filter === f ? (f === "high" ? "bg-red-600" : f === "medium" ? "bg-yellow-600" : f === "low" ? "bg-green-600" : "bg-blue-600") + " text-white" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + " Risk"}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by email, IP, or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TABLE */}
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No login logs found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Risk</th>
                      <th className="px-6 py-3">Behavioral</th>
                      <th className="px-6 py-3">Travel</th>
                      <th className="px-6 py-3">Device ID</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Analyse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => {
                      const riskBadge = getRiskBadge(log.riskScore || 0);
                      const hasBehavioralAnomaly = log.keystrokeAnalysis?.anomalyScore > 40;
                      const hasTravelAnomaly = log.travelAnalysis?.impossibleTravel;
                      
                      return (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-2">
                              {log.isAnomaly && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              {log.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              log.status === "success" ? "bg-green-100 text-green-700" 
                              : log.status === "failed" ? "bg-red-100 text-red-700" 
                              : "bg-yellow-100 text-yellow-700"
                            }`}>{log.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${riskBadge.color}`}>{log.riskScore || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            {log.keystrokeAnalysis ? (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                hasBehavioralAnomaly ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                              }`}>{log.keystrokeAnalysis.anomalyScore?.toFixed(0) || 0}%</span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            {log.travelAnalysis ? (
                              hasTravelAnomaly ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">🚨 {log.travelAnalysis.distanceTraveled?.toFixed(0)}km</span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{log.travelAnalysis.distanceTraveled?.toFixed(0)}km</span>
                              )
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 break-all">{getDeviceLabel(log.deviceId)}</td>
                          <td className="px-6 py-4 text-gray-600">{log.country || "—"}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(log.createdAt)}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => setSelectedLog(log)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition">Explain</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= POPUP ================= */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">🛡️ Threat Analysis Report</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-xl">✖</button>
            </div>

            <div className="p-6">
              {/* BASIC INFO */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm"><b>Email:</b> {selectedLog.email}</p>
                  <p className="text-sm"><b>IP Address:</b> {selectedLog.ipAddress}</p>
                  <p className="text-sm"><b>Country:</b> {selectedLog.country || "Unknown"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><b>Device:</b> {selectedLog.device}</p>
                  <p className="text-sm"><b>Browser:</b> {selectedLog.browser}</p>
                  <p className="text-sm"><b>OS:</b> {selectedLog.os}</p>
                  <p className="text-sm"><b>Device ID:</b> {getDeviceLabel(selectedLog.deviceId)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className={`text-lg font-bold ${selectedLog.status === "success" ? "text-green-600" : "text-red-600"}`}>{selectedLog.status}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  <p className={`text-lg font-bold ${
                    selectedLog.riskScore >= 70 ? "text-red-600" : selectedLog.riskScore >= 40 ? "text-yellow-600" : "text-green-600"
                  }`}>{selectedLog.riskScore || 0}/100</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              {/* BEHAVIORAL ANALYSIS */}
              {selectedLog.keystrokeAnalysis && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2"><Key className="w-4 h-4" />Behavioral Biometrics Analysis</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Anomaly Score:</p>
                      <p className={`font-bold ${selectedLog.keystrokeAnalysis.anomalyScore > 40 ? "text-red-600" : "text-green-600"}`}>{selectedLog.keystrokeAnalysis.anomalyScore?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Confidence:</p>
                      <p className="font-medium">{selectedLog.keystrokeAnalysis.confidence || "N/A"}</p>
                    </div>
                    {selectedLog.keystrokeAnalysis.rawMetrics && (
                      <>
                        <div><p className="text-gray-600">Typing Speed:</p><p className="font-medium">{selectedLog.keystrokeAnalysis.rawMetrics.typingSpeed?.toFixed(1)} keys/s</p></div>
                        <div><p className="text-gray-600">Total Time:</p><p className="font-medium">{selectedLog.keystrokeAnalysis.rawMetrics.totalTypingTime}ms</p></div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TRAVEL ANALYSIS */}
              {selectedLog.travelAnalysis && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2"><Plane className="w-4 h-4" />Travel Analysis</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><p className="text-gray-600">Distance:</p><p className="font-bold">{selectedLog.travelAnalysis.distanceTraveled?.toFixed(0)} km</p></div>
                    <div><p className="text-gray-600">Time Since Last:</p><p className="font-medium">{selectedLog.travelAnalysis.timeSinceLastLogin?.toFixed(1)} hours</p></div>
                    <div><p className="text-gray-600">Speed:</p><p className={`font-bold ${selectedLog.travelAnalysis.impossibleTravel ? "text-red-600" : ""}`}>{selectedLog.travelAnalysis.travelSpeed?.toFixed(0)} km/h</p></div>
                  </div>
                  {selectedLog.travelAnalysis.impossibleTravel && (
                    <p className="mt-3 text-sm text-red-600 bg-red-100 p-2 rounded">🚨 IMPOSSIBLE TRAVEL DETECTED!</p>
                  )}
                </div>
              )}

              {/* THREAT ANALYSIS */}
              <div className="mb-4">
                <p className={`text-lg font-bold mb-2 ${
                  selectedLog.threatExplanation?.riskLevel === "High" || selectedLog.threatExplanation?.riskLevel === "Critical" ? "text-red-600"
                  : selectedLog.threatExplanation?.riskLevel === "Medium" ? "text-yellow-600" : "text-green-600"
                }`}>Risk Level: {selectedLog.threatExplanation?.riskLevel || "Normal"}</p>
                <h4 className="font-semibold mt-4 mb-2">Risk Factors:</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {selectedLog.threatExplanation?.reasons?.length > 0 ? selectedLog.threatExplanation.reasons.map((r, i) => <li key={i} className="text-gray-700">{r}</li>) : <li className="text-gray-500">No risk factors detected</li>}
                </ul>
                <h4 className="font-semibold mt-4 mb-2">Recommendations:</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {selectedLog.threatExplanation?.recommendations?.length > 0 ? selectedLog.threatExplanation.recommendations.map((r, i) => <li key={i} className="text-gray-700">{r}</li>) : <li className="text-gray-500">No action needed</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginLogs;