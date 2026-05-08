import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Bell, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoginTable from "../components/LoginTable";
import AdminChatbot from "../components/AdminChatbot";

// Replace lines 14-15 with:
const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : "https://asian-x-security.onrender.com/api";

const SOCKET_URL = process.env.REACT_APP_API_URL || "https://asian-x-security.onrender.com";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
      auth: {
        token: localStorage.getItem("token")
      },
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("🔌 Socket.IO Connected:", socket.id);
      setSocketConnected(true);
    });

    // 🆕 Listen for auto-created cases (high risk logins)
    socket.on("case:auto-created", (data) => {
      console.log("🛡️ Auto Case Alert:", data);
      setNotifications(prev => [{
        id: Date.now(),
        type: "case_created",
        icon: "🛡️",
        title: "Case Auto-Created",
        message: `${data.email}: ${data.threatType}`,
        riskScore: data.riskScore,
        timestamp: new Date(),
        color: data.riskScore >= 70 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
      }, ...prev].slice(0, 10)); // Keep last 10 notifications
      
      // Auto-refresh data
      fetchData();
    });

    // 🆕 Listen for manual case creation
    socket.on("case:created", (data) => {
      console.log("📋 Manual Case Alert:", data);
      setNotifications(prev => [{
        id: Date.now(),
        type: "case_created",
        icon: "📋",
        title: "Case Created",
        message: `${data.email}: ${data.threatType}`,
        riskScore: data.riskScore,
        timestamp: new Date(),
        color: "bg-blue-50 border-blue-200"
      }, ...prev].slice(0, 10));
    });

    // 🆕 Listen for security alerts
    socket.on("security:alert", (data) => {
      console.log("🚨 Security Alert:", data);
      setNotifications(prev => [{
        id: Date.now(),
        type: "security_alert",
        icon: "🚨",
        title: "Security Alert",
        message: data.email ? `Alert for ${data.email}` : data.message || "Security event detected",
        riskScore: data.riskScore || 0,
        timestamp: new Date(),
        color: "bg-red-50 border-red-200"
      }, ...prev].slice(0, 10));
    });

    // 🆕 Listen for travel anomalies
    socket.on("travel:alert", (data) => {
      console.log("✈️ Travel Alert:", data);
      setNotifications(prev => [{
        id: Date.now(),
        type: "travel_anomaly",
        icon: "✈️",
        title: "Travel Anomaly",
        message: `${data.email}: Impossible travel detected`,
        riskScore: 70,
        timestamp: new Date(),
        color: "bg-orange-50 border-orange-200"
      }, ...prev].slice(0, 10));
    });

    socket.on("honeypot:triggered", (data) => {
    setNotifications(prev => [{
        id: Date.now(),
        type: "honeypot",
        icon: "🪤",
        title: "HONEYPOT TRIGGERED!",
        message: `${data.email} fell for the trap: ${data.action}`,
        riskScore: 100,
        timestamp: new Date(),
        color: "bg-red-100 border-red-300"
    }, ...prev].slice(0, 10));
});

    // 🆕 Listen for server errors
    socket.on("server:error", (data) => {
      console.error("Server Error:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error.message);
      setSocketConnected(false);
    });

    // Subscribe to admin alerts
    socket.emit("subscribe:alerts", { channel: "admin" });

    return () => {
      socket.disconnect();
    };
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

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
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
            <h1 className="text-3xl font-bold text-gray-800">Security Dashboard</h1>
            
            {/* 🆕 NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* 🆕 NOTIFICATION DROPDOWN */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-[500px] overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-gray-800">🔔 Notifications</h3>
                      <p className="text-xs text-gray-500">
                        {notifications.length} alert{notifications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No new notifications</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Alerts will appear here in real-time
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${notif.color}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{notif.icon}</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-sm text-gray-800">
                                  {notif.title}
                                </p>
                                <span className="text-xs text-gray-400">
                                  {getTimeAgo(notif.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              {notif.riskScore > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        notif.riskScore >= 70 ? 'bg-red-500' :
                                        notif.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${notif.riskScore}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500">
                                    Risk: {notif.riskScore}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🆕 CONNECTION STATUS */}
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