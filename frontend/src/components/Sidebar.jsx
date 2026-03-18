import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

import logo from "../assets/logo.png";

function Sidebar({ onLogout }) {
  return (
    <div className="w-64 bg-slate-900 text-gray-300 min-h-screen flex flex-col shadow-xl">

      {/* LOGO */}
      <div className="flex flex-col items-center py-6 border-b border-slate-700">
        <img src={logo} alt="Asian-X Security" className="h-12 mb-2" />
        <p className="text-xs text-slate-400">
          Cyber Security Monitoring
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-6">

        {/* MAIN */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">Main</p>

          {/* Dashboard */}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          {/* Users */}
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <Users size={18} />
            User Management
          </NavLink>

          {/* Login Logs */}
          <NavLink
            to="/admin/logs"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <Activity size={18} />
            Login Logs
          </NavLink>

          {/* Anomalies */}
          <NavLink
            to="/admin/anomalies"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-red-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <AlertTriangle size={18} />
            Anomalies
          </NavLink>

          {/* NEW FRAUD ANALYTICS */}
          <NavLink
            to="/admin/fraud-analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <ShieldCheck size={18} />
            Fraud Analytics
          </NavLink>

        </div>

        {/* ACCOUNT */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">Account</p>

          <NavLink
            to="/admin/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
          >
            <User size={18} />
            Profile
          </NavLink>

          <NavLink
            to="/admin/settings"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>

        {/* SUPPORT */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">Support</p>

          <NavLink
            to="/admin/help"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
          >
            <HelpCircle size={18} />
            Help Center
          </NavLink>
        </div>

      </nav>

      {/* FOOTER */}
      <div className="border-t border-slate-700 p-4">

        <div className="flex items-center gap-2 text-xs text-green-400 mb-3">
          <ShieldCheck size={16} />
          System Secure
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-900/30 transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;