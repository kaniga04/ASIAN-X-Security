import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Lock,
  Bell,
  Palette,
  Shield
} from "lucide-react";

function Settings() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* HEADER */}

          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-500 text-sm">
              Configure system and security preferences
            </p>
          </div>

          <div className="space-y-6 max-w-4xl">

            {/* SECURITY SETTINGS */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-600" />
                <h3 className="font-semibold">
                  Security Preferences
                </h3>
              </div>

              <div className="space-y-4">

                {[
                  {
                    label: "Two-Factor Authentication",
                    desc: "Require 2FA for all admin accounts",
                    checked: true
                  },
                  {
                    label: "Session Timeout",
                    desc: "Auto logout after 30 minutes inactivity",
                    checked: true
                  },
                  {
                    label: "IP Whitelisting",
                    desc: "Allow login only from approved IP addresses",
                    checked: false
                  },
                  {
                    label: "Login Attempt Lockout",
                    desc: "Lock account after 5 failed attempts",
                    checked: true
                  }
                ].map((item) => (

                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >

                    <div>
                      <p className="text-sm font-medium">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.desc}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-5 h-5"
                    />

                  </div>

                ))}

              </div>

            </div>

            {/* NOTIFICATION SETTINGS */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-blue-600" />
                <h3 className="font-semibold">
                  Notification Settings
                </h3>
              </div>

              <div className="space-y-4">

                {[
                  {
                    label: "High Risk Alerts",
                    desc: "Notify when high-risk login detected",
                    checked: true
                  },
                  {
                    label: "Failed Login Reports",
                    desc: "Daily summary of failed login attempts",
                    checked: true
                  },
                  {
                    label: "System Updates",
                    desc: "Notify when system maintenance occurs",
                    checked: false
                  },
                  {
                    label: "Weekly Reports",
                    desc: "Receive weekly analytics report",
                    checked: true
                  }
                ].map((item) => (

                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >

                    <div>
                      <p className="text-sm font-medium">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.desc}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-5 h-5"
                    />

                  </div>

                ))}

              </div>

            </div>

            {/* THEME SETTINGS */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-2 mb-4">
                <Palette size={20} className="text-blue-600" />
                <h3 className="font-semibold">
                  Theme Settings
                </h3>
              </div>

              <div className="flex gap-4">

                {["Dark", "Midnight", "Ocean"].map((theme) => (

                  <button
                    key={theme}
                    className="border rounded-lg px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    {theme}
                  </button>

                ))}

              </div>

            </div>

            {/* PASSWORD CHANGE */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-2 mb-4">
                <Lock size={20} className="text-blue-600" />
                <h3 className="font-semibold">
                  Change Password
                </h3>
              </div>

              <div className="space-y-4 max-w-md">

                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />

                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Update Password
                </button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Settings;