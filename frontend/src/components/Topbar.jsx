import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings, HelpCircle, ChevronDown } from 'lucide-react';

const Topbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-40">
      {/* LEFT - Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs, users, cases..."
            className="bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-500">
          <span>⌘</span>K
        </kbd>
      </div>

      {/* RIGHT - Actions */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50">
              <div className="p-3 border-b">
                <p className="font-semibold text-sm text-gray-800">🔔 Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-800">🛡️ High Risk Login Detected</p>
                  <p className="text-xs text-gray-500 mt-1">asianxauth@gmail.com - Score: 75</p>
                  <p className="text-xs text-gray-400 mt-0.5">2 minutes ago</p>
                </div>
                <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-800">🤖 Bot Attack Blocked</p>
                  <p className="text-xs text-gray-500 mt-1">Superhuman speed detected</p>
                  <p className="text-xs text-gray-400 mt-0.5">15 minutes ago</p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-800">📊 Weekly Report Ready</p>
                  <p className="text-xs text-gray-500 mt-1">Security analytics report generated</p>
                  <p className="text-xs text-gray-400 mt-0.5">1 hour ago</p>
                </div>
              </div>
              <div className="p-2 border-t text-center">
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow">
              <span className="text-sm text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50">
              <div className="p-3 border-b">
                <p className="font-semibold text-sm text-gray-800">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@asianx.sec'}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/admin/profile'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  View Profile
                </button>
                <button
                  onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={() => { navigate('/help'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  Help Center
                </button>
              </div>
              <div className="p-1 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showProfileMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => { setShowProfileMenu(false); setShowNotifications(false); }}
        />
      )}
    </header>
  );
};

export default Topbar;