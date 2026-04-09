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
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";

import logo from "../assets/logo.png";

function Sidebar({ onLogout }) {
  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-gray-300 min-h-screen flex flex-col shadow-2xl">

      {/* LOGO */}
      <div className="flex flex-col items-center py-6 border-b border-slate-700">
        <img src={logo} alt="Asian-X Security" className="h-12 mb-2" />
        <p className="text-xs text-slate-400 tracking-wide">
          Cyber Security Monitoring
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-6">

        {/* MAIN */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-3 tracking-wider">
            Main
          </p>

          {/* Reusable class */}
          {[
            { to: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard", color: "blue" },
            { to: "/admin/users", icon: <Users size={18} />, label: "User Management", color: "blue" },
            { to: "/admin/logs", icon: <Activity size={18} />, label: "Login Logs", color: "blue" },
            { to: "/admin/anomalies", icon: <AlertTriangle size={18} />, label: "Anomalies", color: "red" },
            { to: "/admin/fraud-analytics", icon: <ShieldCheck size={18} />, label: "Fraud Analytics", color: "purple" },
            { to: "/admin/csv-analyzer", icon: <FileSpreadsheet size={18} />, label: "CSV Analyzer", color: "green" },
            { to: "/admin/investigation", icon: <ShieldCheck size={18} />, label: "User Investigation", color: "indigo" }
          ].map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? `bg-${item.color}-600 text-white shadow-md`
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="opacity-80 group-hover:opacity-100">
                {item.icon}
              </span>
              <span className="text-sm font-medium tracking-wide">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* ACCOUNT */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-3 tracking-wider">
            Account
          </p>

          <NavLink
            to="/admin/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <User size={18} />
            <span className="text-sm font-medium">Profile</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
        </div>

        {/* SUPPORT */}
        <div>
          <p className="text-xs uppercase text-slate-500 mb-3 tracking-wider">
            Support
          </p>

          <NavLink
            to="/admin/help"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <HelpCircle size={18} />
            <span className="text-sm font-medium">Help Center</span>
          </NavLink>
        </div>

      </nav>

      {/* FOOTER */}
      <div className="border-t border-slate-700 p-4">

        <div className="flex items-center gap-2 text-xs text-green-400 mb-4">
          <ShieldCheck size={16} />
          <span className="tracking-wide">System Secure</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>

      </div>

    </div>
  );
}

export default Sidebar;