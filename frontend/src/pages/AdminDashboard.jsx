import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SummaryCards from "../components/SummaryCards";
import RiskChart from "../components/RiskChart";
import LoginTable from "../components/LoginTable";
import AdminChatbot from "../components/AdminChatbot";

const API_BASE = "https://asian-x-security.onrender.com/api";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ simulation mode
  const [isSimulated, setIsSimulated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [isSimulated]); // ✅ trigger on mode change

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const logsRes = await axios.get(`${API_BASE}/auth/logs`);

      let usersData = [];
      try {
        const usersRes = await axios.get(`${API_BASE}/auth/users`);
        usersData = usersRes.data;
      } catch (err) {
        console.warn("Users API error");
      }

      const allLogs = logsRes.data || [];

      // ✅ FIXED FILTER
      const filteredLogs = isSimulated
        ? allLogs.filter((log) => log.isSimulated === true)
        : allLogs.filter((log) => log.isSimulated !== true);

      setLogs(filteredLogs);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SIMULATE ================= */
  const simulateAttack = async (type) => {
    try {
      await axios.post(`${API_BASE}/auth/simulate-attack`, { type });
      setIsSimulated(true); // switch mode
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  /* ================= REFRESH ================= */
  const handleRefresh = () => {
    setIsSimulated(false); // back to real logs
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ================= HIGH RISK ================= */
  const highRiskLogs = logs.filter((log) => log.riskScore >= 70);

  const getAnalysis = (log) => {
    const hour = new Date(log.createdAt).getHours();

    return {
      location: log.country === "IN" ? "normal" : "abnormal",
      time: hour >= 6 && hour <= 22 ? "normal" : "abnormal",
      device: log.device === "Desktop" ? "normal" : "unknown",
      behavior: log.riskScore >= 80 ? "warning" : "normal"
    };
  };

  const renderStatus = (type) => {
    if (type === "normal") return "✅";
    if (type === "abnormal") return "❌";
    return "⚠️";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Security Dashboard
              </h1>
              <p className="text-gray-500">
                Real-time threat monitoring and analytics
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>

              <button
                onClick={() => simulateAttack("brute_force")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simulate Attack
              </button>
            </div>
          </div>

          {/* MODE INDICATOR */}
          {isSimulated && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
              ⚠️ Simulation Mode Active — Showing attack data
            </div>
          )}

          {/* SUMMARY */}
          <SummaryCards logs={logs} users={users} />

          {/* TABLE + CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Login Activity Timeline
              </h2>

              <div className="h-[320px] overflow-auto">
                <LoginTable logs={logs} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Risk Level Distribution
              </h2>

              <div className="h-[320px]">
                <RiskChart logs={logs} />
              </div>
            </div>
          </div>

          {/* HIGH RISK */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              🚨 High Risk Login Analysis
            </h2>

            {highRiskLogs.length === 0 ? (
              <p className="text-gray-500 text-center">
                No high-risk activities detected
              </p>
            ) : (
              <div className="space-y-6">

                {highRiskLogs.map((log) => {
                  const analysis = getAnalysis(log);

                  const row = (label, value) => (
                    <div className="flex justify-between items-center border-b py-2">
                      <span className="text-gray-600">{label}</span>

                      <div className="flex gap-4 items-center">
                        <span className="font-semibold">
                          {renderStatus(value)} User
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-semibold text-green-600">
                          ✅ Normal
                        </span>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={log._id}
                      className="rounded-xl border bg-red-50 p-5 shadow-sm"
                    >

                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="font-bold text-gray-800">
                            {log.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <span className="text-red-600 font-bold text-lg">
                          Risk {log.riskScore}
                        </span>
                      </div>

                      <div className="bg-white rounded-lg p-4 text-sm">
                        <p className="font-semibold text-gray-700 mb-3">
                          User vs Normal Profile
                        </p>

                        {row("Location", analysis.location)}
                        {row("Time", analysis.time)}
                        {row("Device", analysis.device)}
                        {row("Behavior", analysis.behavior)}
                      </div>

                      <div className="mt-3 text-xs text-gray-600">
                        IP: {log.ipAddress} | {log.country} | {log.browser} | {log.os}
                      </div>

                    </div>
                  );
                })}

              </div>
            )}
          </div>

        </main>
      </div>

      <AdminChatbot />
    </div>
  );
}

export default AdminDashboard;