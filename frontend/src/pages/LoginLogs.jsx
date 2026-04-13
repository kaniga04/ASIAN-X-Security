import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

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

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">

                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Risk</th>
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
        </main>
      </div>

      {/* ================= POPUP ================= */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-3 right-3 text-gray-500 text-lg"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">
              Threat Analysis
            </h2>

            {/* BASIC INFO */}
            <div className="space-y-2 text-sm">
              <p><b>Email:</b> {selectedLog.email}</p>
              <p><b>IP:</b> {selectedLog.ipAddress}</p>
              <p><b>Location:</b> {selectedLog.state || "Unknown"}, {selectedLog.country}</p>
              <p><b>Device:</b> {selectedLog.device}</p>
              <p><b>Browser:</b> {selectedLog.browser}</p>
              <p><b>OS:</b> {selectedLog.os}</p>
              <p><b>Time:</b> {formatDate(selectedLog.createdAt)}</p>
              <p><b>Status:</b> {selectedLog.status}</p>
              <p><b>Risk Score:</b> {selectedLog.riskScore}</p>
            </div>

            {/* ANALYSIS */}
            <div className="mt-4">
              <h3 className="font-semibold text-red-600 mb-2">
                Analysis
              </h3>

              <p className={`font-bold mb-2 ${
                selectedLog.threatExplanation?.riskLevel === "High"
                  ? "text-red-600"
                  : selectedLog.threatExplanation?.riskLevel === "Medium"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}>
                Risk Level: {selectedLog.threatExplanation?.riskLevel || "Normal"}
              </p>

              {/* REASONS */}
              <ul className="list-disc ml-5 text-sm">
                {selectedLog.threatExplanation?.reasons?.length > 0 ? (
                  selectedLog.threatExplanation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))
                ) : (
                  <li>No risk factors detected</li>
                )}
              </ul>

              {/* RECOMMENDATIONS */}
              <h4 className="mt-3 font-semibold">
                Recommendations:
              </h4>

              <ul className="list-disc ml-5 text-sm">
                {selectedLog.threatExplanation?.recommendations?.length > 0 ? (
                  selectedLog.threatExplanation.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))
                ) : (
                  <li>No action needed</li>
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