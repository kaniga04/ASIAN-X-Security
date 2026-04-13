import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";
import axios from "axios";

function Topbar() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  let user = null;

  try {
    user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
  } catch {
    user = null;
  }

  const basePath = user?.role === "admin" ? "/admin" : "/user";

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post(
          "https://asian-x-security.onrender.com/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">

      {/* LEFT */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Security Dashboard
        </h1>
        <p className="text-xs text-gray-500">
          Login Anomaly Detection System
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* 🔔 NOTIFICATIONS */}
        <div className="relative group">
          <button className="relative text-gray-600 hover:text-gray-900 transition">
            <Bell size={20} />

            {/* 🔥 You can replace 3 with dynamic high risk count */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
              3
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 
            opacity-0 invisible group-hover:visible group-hover:opacity-100
            transition-all duration-200
            bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border z-50">

            <div className="p-3 border-b font-semibold text-sm">
              Security Alerts
            </div>

            <div className="p-3 text-sm space-y-2">
              <div className="bg-red-50 p-2 rounded-lg">
                ⚠️ High risk login detected
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg">
                Suspicious activity detected
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                New device login
              </div>
            </div>

            <button
              onClick={() => navigate(`${basePath}/logs`)}
              className="w-full text-center text-blue-600 text-sm py-2 border-t hover:bg-gray-50 rounded-b-2xl"
            >
              View All Logs
            </button>
          </div>
        </div>

        {/* 👤 PROFILE */}
        <div className="relative group">
          <div className="flex items-center gap-3 cursor-pointer">

            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md">
              <User size={18} />
            </div>

            <div className="text-sm leading-tight">
              <p className="font-medium text-gray-800">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || "Administrator"}
              </p>
            </div>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 
            opacity-0 invisible group-hover:visible group-hover:opacity-100
            transition-all duration-200
            bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border z-50">

            <button
              onClick={() => navigate(`${basePath}/profile`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded-t-2xl"
            >
              👤 Profile
            </button>

            <button
              onClick={() => navigate(`${basePath}/investigation`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              🔍 Investigation
            </button>

            <button
              onClick={() => navigate(`${basePath}/csv-analyzer`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              📊 CSV Analyzer
            </button>

            <button
              onClick={() => navigate(`${basePath}/settings`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              ⚙️ Settings
            </button>

            <button
              onClick={() => navigate(`${basePath}/help`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded-b-2xl"
            >
              ❓ Help Center
            </button>

          </div>
        </div>

        {/* 🚪 LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>
    </header>
  );
}

export default Topbar;