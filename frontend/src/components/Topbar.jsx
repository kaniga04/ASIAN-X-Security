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

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
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
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b">

      {/* LEFT SIDE - PAGE TITLE */}

      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Security Dashboard
        </h1>
        <p className="text-xs text-gray-500">
          Login Anomaly Detection System
        </p>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex items-center gap-6">

        {/* Notifications */}

        <button className="relative text-gray-600 hover:text-gray-800 transition">
          <Bell size={20} />

          {/* Notification badge */}

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            3
          </span>
        </button>

        {/* User Info */}

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center">
            <User size={18} />
          </div>

          <div className="text-sm">
            <p className="font-medium text-gray-700">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

        </div>

        {/* Logout Button */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </header>
  );
}

export default Topbar;