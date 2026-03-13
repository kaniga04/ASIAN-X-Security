import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  User,
  Mail,
  Shield,
  Key
} from "lucide-react";

function Profile() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* PAGE HEADER */}

          <div>
            <h1 className="text-2xl font-bold">
              Profile
            </h1>

            <p className="text-gray-500 text-sm">
              Manage your account and security settings
            </p>
          </div>

          {/* GRID */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* PROFILE CARD */}

            <div className="bg-white rounded-xl shadow p-6 text-center">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold">
                Admin User
              </h2>

              <p className="text-sm text-gray-500">
                admin@asian-x.com
              </p>

              <span className="inline-block bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full mt-3">
                Super Admin
              </span>

              <div className="mt-6 space-y-3 text-left">

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} />
                  admin@asian-x.com
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={16} />
                  2FA Enabled
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Key size={16} />
                  Last login: 2 hours ago
                </div>

              </div>

            </div>

            {/* EDIT PROFILE */}

            <div className="lg:col-span-2 space-y-6">

              {/* PERSONAL INFO */}

              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="text-sm font-semibold mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="text-xs text-gray-500">
                      Full Name
                    </label>

                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Email
                    </label>

                    <input
                      type="email"
                      defaultValue="admin@asian-x.com"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Phone
                    </label>

                    <input
                      type="text"
                      defaultValue="+60 12-345-6789"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Department
                    </label>

                    <input
                      type="text"
                      defaultValue="Security Operations"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                </div>

                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Update Profile
                </button>

              </div>

              {/* CHANGE PASSWORD */}

              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="text-sm font-semibold mb-4">
                  Change Password
                </h3>

                <div className="space-y-4 max-w-md">

                  <div>
                    <label className="text-xs text-gray-500">
                      Current Password
                    </label>

                    <input
                      type="password"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      New Password
                    </label>

                    <input
                      type="password"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                </div>

                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Change Password
                </button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Profile;