import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  FileSpreadsheet,
  LogOut,
  AlertTriangle,
  Activity,
  User
} from "lucide-react";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/logs", icon: Activity, label: "Login Logs" },
    { path: "/admin/anomalies", icon: AlertTriangle, label: "Anomalies" },
    { path: "/admin/cases", icon: FileSpreadsheet, label: "Cases" },
    { path: "/admin/profile", icon: User, label: "Profile" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
    { path: "/help", icon: HelpCircle, label: "Help Center" },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Asian-X</h1>
            <p className="text-xs text-slate-400 tracking-wide">Security Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-white/10 text-white border-l-2 border-indigo-400" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-colors duration-200 ${
              window.location.pathname === item.path 
                ? "text-indigo-400" 
                : "text-slate-400 group-hover:text-white"
            }`} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;