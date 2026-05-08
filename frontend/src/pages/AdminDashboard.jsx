import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoginTable from "../components/LoginTable";
import AdminChatbot from "../components/AdminChatbot";

const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : "https://asian-x-security.onrender.com/api";

const SOCKET_URL = process.env.REACT_APP_API_URL || "https://asian-x-security.onrender.com";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const logsRes = await axios.get(`${API_BASE}/auth/logs`);
      let usersData = [];
      try {
        const usersRes = await axios.get(`${API_BASE}/auth/users`);
        usersData = usersRes.data;
      } catch {
        console.warn("Users API not available");
      }
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET.IO CONNECTION ================= */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("🔌 Socket.IO Connected:", socket.id);
      setSocketConnected(true);
    });

    socket.on("case:auto-created", (data) => {
      console.log("🛡️ Case created:", data.email);
      fetchData();
    });

    socket.on("case:created", (data) => {
      console.log("📋 Manual case:", data.email);
    });

    socket.on("security:alert", (data) => {
      console.log("🚨 Alert:", data.email || data.message);
    });

    socket.on("travel:alert", (data) => {
      console.log("✈️ Travel alert:", data.email);
    });

    socket.on("honeypot:triggered", (data) => {
      console.log("🪤 Honeypot triggered:", data.email);
    });

    socket.on("server:error", (data) => {
      console.error("Server Error:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
      setSocketConnected(false);
    });

    socket.emit("subscribe:alerts", { channel: "admin" });

    return () => socket.disconnect();
  }, [fetchData]);

  /* ================= INITIAL FETCH ================= */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= HELPERS ================= */
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalLogins = logs.length;
  const highRisk = logs.filter(l => (l.riskScore || 0) >= 70).length;
  const anomalies = logs.filter(l => l.isAnomaly).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 space-y-6">
          
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Security Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time security monitoring overview</p>
            </div>
          </div>

          {/* CONNECTION STATUS */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-xs ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
              {socketConnected ? '🟢 Real-time monitoring active' : '🔴 Real-time connection lost'}
            </span>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <p className="text-gray-500 text-sm">Total Logins</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalLogins}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-red-500">
              <p className="text-gray-500 text-sm">High Risk</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{highRisk}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500">
              <p className="text-gray-500 text-sm">Anomalies</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{anomalies}</p>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Login Activity</h2>
            <LoginTable logs={logs.slice(0, 10)} />
          </div>
        </main>
      </div>
      <AdminChatbot />
    </div>
  );
}

export default AdminDashboard;