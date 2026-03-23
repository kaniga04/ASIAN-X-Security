import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Anomalies() {

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    // 🔥 Auto refresh every 10 sec
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);

  }, []);

  const fetchLogs = async () => {
    try {

      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );

      const anomalyData = res.data.filter(log => log.isAnomaly);

      setLogs(anomalyData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ===== Severity =====
  const getSeverity = (riskScore) => {
    if (riskScore >= 80) return "critical";
    if (riskScore >= 50) return "medium";
    return "low";
  };

  // ===== Resolve =====
  const resolveAnomaly = async (id) => {
    try {
      await axios.put(
        `https://asian-x-security.onrender.com/api/auth/logs/resolve/${id}`
      );
      fetchLogs();
    } catch (error) {
      console.error(error);
    }
  };

  // ===== Export CSV =====
  const exportCSV = () => {

    const rows = logs.map(log => ({
      Email: log.email,
      IP: log.ipAddress?.split(",")[0].trim(), // ✅ FIXED HERE
      Risk: log.riskScore,
      Status: log.status,
      Time: new Date(log.loginTime).toLocaleString()
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Email,IP,Risk,Status,Time"]
        .concat(
          rows.map(r =>
            `${r.Email},${r.IP},${r.Risk},${r.Status},${r.Time}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anomalies.csv");

    document.body.appendChild(link);
    link.click();
  };

  const filteredLogs = logs
    .filter(log =>
      log.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(log =>
      filter === "all"
        ? true
        : getSeverity(log.riskScore) === filter
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold">
              Anomaly Detection
            </h2>
            <p className="text-gray-500 text-sm">
              AI-detected abnormal login behaviors
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-between">

            <input
              type="text"
              placeholder="Search user email..."
              className="border px-4 py-2 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border px-4 py-2 rounded-lg"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={exportCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Export CSV
            </button>

          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">IP Address</th>
                  <th className="px-6 py-3 text-left">Country</th>
                  <th className="px-6 py-3 text-left">Risk Score</th>
                  <th className="px-6 py-3 text-left">ML Score</th>
                  <th className="px-6 py-3 text-left">MITRE Tactic</th>
                  <th className="px-6 py-3 text-left">MITRE Technique</th>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => {

                  const severity = getSeverity(log.riskScore);

                  // ✅ EXTRACT ONLY REAL IP
                  const realIP = log.ipAddress?.split(",")[0].trim();

                  return (
                    <tr
                      key={log._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium">
                        {log.email}
                      </td>

                      <td className="px-6 py-4">
                        {realIP}
                      </td>

                      <td className="px-6 py-4">
                        {log.country || "Unknown"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            severity === "critical"
                              ? "bg-red-100 text-red-700"
                              : severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                          {log.riskScore}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {log.mlScore || "0.85"}
                      </td>

                      <td className="px-6 py-4">
                        {log.mitreTactic || "Initial Access"}
                      </td>

                      <td className="px-6 py-4">
                        {log.mitreTechnique || "T1078 - Valid Accounts"}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(log.loginTime).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => resolveAnomaly(log._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Resolve
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Anomalies;