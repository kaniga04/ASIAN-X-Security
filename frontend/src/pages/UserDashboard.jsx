import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const res = await axios.get("http://asian-x-security.onrender.com/api/auth/logs");
        
        // Filter logs for this user
        const userLogs = res.data.filter(
          (log) => log.email === user?.email
        );

        if (userLogs.length > 0) {
          setLastLogin(userLogs[0]); // Most recent login
        }
      } catch (err) {
        console.error("Error fetching user logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLogs();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold text-gray-700">
          User Dashboard
        </h2>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6 space-y-6">

        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name} 👋
          </h3>
          <p className="text-gray-500 mt-2">
            Here is your recent login activity and security status.
          </p>
        </div>

        {/* Last Login Info */}
        {lastLogin ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <InfoCard
              title="Last Login Time"
              value={new Date(lastLogin.loginTime).toLocaleString()}
              color="blue"
            />

            <InfoCard
              title="Login Status"
              value={lastLogin.status}
              color={lastLogin.status === "success" ? "green" : "yellow"}
            />

            <InfoCard
              title="Risk Score"
              value={lastLogin.riskScore}
              color={lastLogin.riskScore >= 50 ? "red" : "green"}
            />

          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm text-gray-500">
            No login records found.
          </div>
        )}

      </main>
    </div>
  );
}

/* Reusable Info Card */
function InfoCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h4 className="text-lg font-bold text-gray-800 mt-1">{value}</h4>
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}
      >
        <span className="font-bold text-sm">{value}</span>
      </div>
    </div>
  );
}

export default UserDashboard;
