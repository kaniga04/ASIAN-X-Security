import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SummaryCards from "../components/SummaryCards";
import RiskChart from "../components/RiskChart";
import LoginTable from "../components/LoginTable";
import AnomalyPanel from "../components/AnomalyPanel";
import AdminChatbot from "../components/AdminChatbot";

function AdminDashboard() {

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {

      try {

        const logsRes = await axios.get(
          "https://asian-x-security.onrender.com/api/auth/logs"
        );

        const usersRes = await axios.get(
          "https://asian-x-security.onrender.com/api/auth/users"
        );

        setLogs(logsRes.data);
        setUsers(usersRes.data);

      } catch (error) {

        console.error("Dashboard fetch error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  const handleLogout = () => {

    localStorage.clear();
    navigate("/");

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* MAIN CONTENT */}

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* HEADER */}

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              Security Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Real-time threat monitoring and analytics
            </p>

          </div>

          {/* SUMMARY CARDS */}

          <SummaryCards logs={logs} users={users} />

          {/* CHART SECTION */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LOGIN ACTIVITY */}

            <div className="bg-white rounded-xl shadow-md p-6">

              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Login Activity Timeline
              </h2>

              <div className="h-[320px] overflow-auto">
                <LoginTable logs={logs} />
              </div>

            </div>

            {/* RISK CHART */}

            <div className="bg-white rounded-xl shadow-md p-6">

              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Risk Level Distribution
              </h2>

              <div className="h-[320px]">
                <RiskChart logs={logs} />
              </div>

            </div>

          </div>

          {/* ANOMALY PANEL */}

          <div className="bg-white rounded-xl shadow-md p-6">

            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Detected Security Anomalies
            </h2>

            <AnomalyPanel logs={logs} />

          </div>

        </main>

      </div>

      {/* Chatbot */}
      <AdminChatbot />

    </div>

  );

}

export default AdminDashboard;