import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  AlertTriangle, Shield, Search, X, CheckCircle, 
  Eye, MapPin, Clock, Monitor, Key
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : "https://asian-x-security.onrender.com/api";

function Anomalies() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveMsg, setResolveMsg] = useState("");

  const [form, setForm] = useState({
    actionTaken: "",
    threatType: "",
    notes: ""
  });

  /* ================= FETCH LOGS ================= */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/auth/logs`);
      const anomalyData = (res.data || []).filter(
        log => log.isAnomaly && !log.resolved
      );
      setLogs(anomalyData);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* ================= FILTER LOGS ================= */
  const filteredLogs = logs.filter(log => {
    if (filter === "high" && (log.riskScore || 0) < 70) return false;
    if (filter === "critical" && (log.riskScore || 0) < 85) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.email?.toLowerCase().includes(term) ||
        log.ipAddress?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  /* ================= STATS ================= */
  const stats = {
    total: logs.length,
    high: logs.filter(l => (l.riskScore || 0) >= 70).length,
    critical: logs.filter(l => (l.riskScore || 0) >= 85).length,
    behavioral: logs.filter(l => l.keystrokeAnalysis?.anomalyScore > 40).length,
    travel: logs.filter(l => l.travelAnalysis?.impossibleTravel).length
  };

  /* ================= OPEN MODAL ================= */
  const openResolveModal = (log) => {
    setSelectedLog(log);
    setForm({ actionTaken: "", threatType: "", notes: "" });
    setResolveMsg("");
    setShowModal(true);
  };

  /* ================= SUBMIT RESOLVE ================= */
  const handleResolve = async () => {
    if (!form.actionTaken || !form.threatType) {
      setResolveMsg("❌ Please select action and threat type");
      return;
    }

    setResolving(true);
    setResolveMsg("");

    try {
      await axios.post(`${API_BASE}/auth/mark-safe`, { logId: selectedLog._id });
      
      // Also update with investigation details
      await axios.post(`${API_BASE}/cases/create`, {
        logId: selectedLog._id,
        actionTaken: form.actionTaken,
        threatType: form.threatType,
        notes: form.notes || "Investigation completed",
        severity: (selectedLog.riskScore || 0) >= 85 ? "Critical" : "High"
      });

      setResolveMsg("✅ Anomaly resolved successfully!");
      setTimeout(() => {
        setShowModal(false);
        fetchLogs();
      }, 1500);
    } catch (error) {
      console.error("Resolve error:", error);
      setResolveMsg("❌ Failed to resolve. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
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
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Anomaly Detection
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                AI-detected suspicious login events requiring investigation
              </p>
            </div>
            <button
              onClick={fetchLogs}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-xs text-gray-500">Total Anomalies</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
              <p className="text-xs text-red-600">High Risk</p>
              <p className="text-2xl font-bold text-red-700">{stats.high}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-200">
              <p className="text-xs text-orange-600">Critical</p>
              <p className="text-2xl font-bold text-orange-700">{stats.critical}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-200">
              <p className="text-xs text-purple-600">Behavioral</p>
              <p className="text-2xl font-bold text-purple-700">{stats.behavioral}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
              <p className="text-xs text-blue-600">Travel</p>
              <p className="text-2xl font-bold text-blue-700">{stats.travel}</p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex gap-4 mb-4">
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "high", label: "High Risk" },
                { value: "critical", label: "Critical" }
              ].map(btn => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    filter === btn.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* TABLE */}
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No unresolved anomalies</p>
              <p className="text-sm text-gray-400 mt-1">All clear! Your system is secure.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">IP Address</th>
                    <th className="px-6 py-3 text-left">Risk Score</th>
                    <th className="px-6 py-3 text-left">Country</th>
                    <th className="px-6 py-3 text-left">Time</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            (log.riskScore || 0) >= 85 ? "text-red-500" : "text-orange-500"
                          }`} />
                          {log.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {log.ipAddress || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (log.riskScore || 0) >= 85 ? "bg-red-100 text-red-700" :
                          (log.riskScore || 0) >= 70 ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {log.riskScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.country || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedLog(log); setShowDetail(true); }}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => openResolveModal(log)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs transition"
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ================= RESOLVE MODAL ================= */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">🔍 Resolve Anomaly</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* USER INFO */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><b>User:</b> {selectedLog.email}</p>
                <p><b>IP:</b> {selectedLog.ipAddress}</p>
                <p><b>Risk Score:</b> {selectedLog.riskScore}/100 ({selectedLog.riskLevel})</p>
                <p><b>Time:</b> {formatDate(selectedLog.createdAt)}</p>
              </div>

              {/* ACTION */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Action Taken *</label>
                <select
                  value={form.actionTaken}
                  onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Action</option>
                  <option value="False Positive">✅ False Positive - Legitimate User</option>
                  <option value="Block IP">🚫 Block IP Address</option>
                  <option value="Password Reset Required">🔑 Force Password Reset</option>
                  <option value="Account Locked">🔒 Lock Account</option>
                  <option value="MFA Enforced">📱 Enable MFA for User</option>
                  <option value="Monitoring">👁️ Enhanced Monitoring</option>
                </select>
              </div>

              {/* THREAT TYPE */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Threat Type *</label>
                <select
                  value={form.threatType}
                  onChange={(e) => setForm({ ...form, threatType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Threat Type</option>
                  <option value="Brute Force">🔨 Brute Force Attack</option>
                  <option value="Credential Stuffing">📋 Credential Stuffing</option>
                  <option value="Behavioral Anomaly">🧬 Behavioral DNA Mismatch</option>
                  <option value="Impossible Travel">✈️ Impossible Travel</option>
                  <option value="Suspicious Location">📍 Suspicious Location</option>
                  <option value="Bot Attack">🤖 Automated Bot</option>
                  <option value="VPN/Proxy">🛡️ VPN/Proxy Usage</option>
                </select>
              </div>

              {/* NOTES */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Investigation Notes</label>
                <textarea
                  placeholder="Describe findings and actions taken..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {resolveMsg && (
                <div className={`p-3 rounded-lg text-sm ${
                  resolveMsg.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {resolveMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {resolving ? "Resolving..." : "Apply & Resolve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAIL MODAL ================= */}
      {showDetail && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">📋 Anomaly Details</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedLog.country || "Unknown"}, {selectedLog.state || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <span>{selectedLog.device} ({selectedLog.browser})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 text-gray-400" />
                  <span>Device ID: {selectedLog.deviceId?.slice(0, 12)}...</span>
                </div>
              </div>

              {selectedLog.threatExplanation?.reasons?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-2">Risk Factors:</p>
                  <ul className="list-disc ml-5 text-sm text-red-700 space-y-1">
                    {selectedLog.threatExplanation.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLog.threatExplanation?.recommendations?.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-blue-800 mb-2">Recommendations:</p>
                  <ul className="list-disc ml-5 text-sm text-blue-700 space-y-1">
                    {selectedLog.threatExplanation.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Anomalies;