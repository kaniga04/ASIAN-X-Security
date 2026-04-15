import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Activity, User, LogOut } from "lucide-react";

function UserSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 min-h-screen flex flex-col">

      {/* HEADER */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          User Panel
        </h2>
        <p className="text-xs text-gray-500">
          Security Overview
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2">

        {/* ✅ Dashboard (points to activity) */}
        <NavLink
          to="/user/activity"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
            ${
              isActive
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Activity */}
        <NavLink
          to="/user/activity"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
            ${
              isActive
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Activity size={18} />
          My Activity
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/user/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
            ${
              isActive
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <User size={18} />
          Profile
        </NavLink>

      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </div>
  );
}

export default UserSidebar;