import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Topbar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-100 px-4 py-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;