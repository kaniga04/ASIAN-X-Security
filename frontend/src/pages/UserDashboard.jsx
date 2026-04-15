import React, { useEffect, useState } from "react";
import axios from "axios";
import UserSidebar from "../components/UserSidebar";
import Topbar from "../components/Topbar";

function UserDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  /* ✅ FETCH LOGS */
  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );

      const userLogs = res.data.filter(
        (log) => log.email === user?.email
      );

      setLogs(userLogs.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []); // ✅ warning ignored safely

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  /* ✅ ACTION: THIS WAS ME */
  const handleThisWasMe = async (logId) => {
    try {
      await axios.post(
        "https://asian-x-security.onrender.com/api/auth/mark-safe",
        { logId }
      );

      alert("Marked as safe ✅");
      fetchLogs();

    } catch (err) {
      console.error(err);
    }
  };

  /* ✅ ACTION: NOT ME */
  const handleNotMe = async (logId) => {
    try {
      await axios.post(
        "https://asian-x-security.onrender.com/api/auth/report-attack",
        { logId }
      );

      alert("Reported to admin 🚨");
      fetchLogs();

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* WELCOME */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.name} 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Monitor your account activity and security status.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card title="Total Logins" value={logs.length} color="blue" />

            <Card
              title="Last Login"
              value={logs[0] ? formatDate(logs[0].createdAt) : "N/A"}
              color="green"
            />

            <Card
              title="Risk Score"
              value={logs[0]?.riskScore || "N/A"}
              color={
                logs[0]?.riskScore >= 70
                  ? "red"
                  : logs[0]?.riskScore >= 40
                  ? "yellow"
                  : "green"
              }
            />

          </div>

          {/* LOGIN TABLE */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Recent Login Activity
              </h3>

              <span className="text-xs text-gray-400">
                Last 5 records
              </span>
            </div>

            {logs.length === 0 ? (
              <p className="text-gray-500">No login records found</p>
            ) : (
              <table className="w-full text-sm">

                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Device</th>
                    <th className="p-3 text-left">Risk</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t hover:bg-gray-50 transition"
                    >

                      <td className="p-3">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="p-3">
                        {log.country || "Unknown"}
                      </td>

                      <td className="p-3">
                        {log.device || "Unknown"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.riskScore >= 70
                              ? "bg-red-100 text-red-600"
                              : log.riskScore >= 40
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {log.riskScore}
                        </span>
                      </td>

                      {/* ✅ ACTION BUTTONS */}
                      <td className="p-3">
                        <div className="flex gap-2">

                          <button
                            onClick={() => handleThisWasMe(log._id)}
                            className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs hover:bg-green-200"
                          >
                            This was me
                          </button>

                          <button
                            onClick={() => handleNotMe(log._id)}
                            className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs hover:bg-red-200"
                          >
                            Not me
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}

/* CARD */
function Card({ title, value, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition">

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h4 className="text-lg font-bold text-gray-800 mt-1">
          {value}
        </h4>
      </div>

      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${styles[color]}`}
      >
        <span className="text-sm font-bold">{value}</span>
      </div>

    </div>
  );
}

export default UserDashboard;