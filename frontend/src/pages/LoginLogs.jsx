import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://asian-x-security.onrender.com";

  /* ================= FETCH LOGS ================= */
 const fetchLogs = useCallback(async () => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/logs`);

    const sortedLogs = res.data.sort(
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
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
          <h2 className="text-2xl font-bold mb-6">
            Login Activity Logs
          </h2>

          {/* EMPTY STATE */}
          {logs.length === 0 ? (
            <p className="text-gray-500">
              No login logs found ⚠️
            </p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">

                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Risk</th>
                      <th className="px-6 py-3">Device ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Analyse</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">

                        <td className="px-6 py-4 font-medium">
                          {log.email}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            log.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {log.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            log.riskScore >= 70
                              ? "bg-red-100 text-red-700"
                              : log.riskScore >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {log.riskScore}
                          </span>
                        </td>

                        {/* ✅ NEW DEVICE ID COLUMN */}
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {log.deviceId || "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Explain
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= POPUP ================= */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-3 right-3 text-gray-500 text-lg"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">
              Threat Analysis
            </h2>

            <div className="space-y-2 text-sm">
              <p><b>Email:</b> {selectedLog.email}</p>
              <p><b>IP:</b> {selectedLog.ipAddress}</p>
              <p><b>Device ID:</b> {selectedLog.deviceId || "N/A"}</p>
              <p><b>Location:</b> {selectedLog.state}, {selectedLog.country}</p>
              <p><b>Device:</b> {selectedLog.device}</p>
              <p><b>Browser:</b> {selectedLog.browser}</p>
              <p><b>OS:</b> {selectedLog.os}</p>
              <p><b>Time:</b> {formatDate(selectedLog.createdAt)}</p>
              <p><b>Risk Score:</b> {selectedLog.riskScore}</p>
            </div>

            {/* ANALYSIS */}
            <div className="mt-4">
              <p className="font-bold">
                Risk Level: {selectedLog.threatExplanation?.riskLevel || "Normal"}
              </p>

              <ul className="list-disc ml-5 text-sm">
                {selectedLog.threatExplanation?.reasons?.length > 0 ? (
                  selectedLog.threatExplanation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))
                ) : (
                  <li>No risk factors</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default LoginLogs;