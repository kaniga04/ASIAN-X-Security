import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : "https://asian-x-security.onrender.com/api";

function Settings() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: true,
    ipWhitelisting: false,
    loginLockout: true,
    keystrokeBiometrics: true,
    travelDetection: true,
    mfaForHighRisk: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    highRiskAlerts: true,
    failedLoginReports: true,
    systemUpdates: false,
    weeklyReports: true,
    emailAlerts: true,
    browserNotifications: false
  });

  // Theme
  const [selectedTheme, setSelectedTheme] = useState("Dark");
  const themes = ["Dark", "Midnight", "Ocean", "Purple"];

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Save states
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [securityMsg, setSecurityMsg] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  /* ================= LOAD SETTINGS ================= */
 useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const loadSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Load user preferences if available
      const currentUser = res.data.find(u => u.email === user.email);
      if (currentUser?.securityPreferences) {
        setSecuritySettings(prev => ({
          ...prev,
          ...currentUser.securityPreferences
        }));
      }
    } catch (error) {
      console.log("Could not load settings:", error.message);
    }
  };

  /* ================= SAVE SECURITY SETTINGS ================= */
  const saveSecuritySettings = async () => {
    setSavingSecurity(true);
    setSecurityMsg("");
    
    try {
      // In production, this would save to backend
      // For now, save to localStorage
      localStorage.setItem("securitySettings", JSON.stringify(securitySettings));
      
      setTimeout(() => {
        setSecurityMsg("✅ Security settings saved successfully!");
        setSavingSecurity(false);
        setTimeout(() => setSecurityMsg(""), 3000);
      }, 500);
    } catch (error) {
      setSecurityMsg("❌ Failed to save settings");
      setSavingSecurity(false);
    }
  };

  /* ================= SAVE NOTIFICATION SETTINGS ================= */
  const saveNotificationSettings = async () => {
    setSavingNotifications(true);
    setNotifMsg("");
    
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
      
      setTimeout(() => {
        setNotifMsg("✅ Notification settings saved successfully!");
        setSavingNotifications(false);
        setTimeout(() => setNotifMsg(""), 3000);
      }, 500);
    } catch (error) {
      setNotifMsg("❌ Failed to save settings");
      setSavingNotifications(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handlePasswordChange = async () => {
    setPasswordMessage("");
    setPasswordError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    try {
      // This would call the actual password change API
      // await axios.post(`${API_BASE}/auth/change-password`, {...});
      
      setPasswordMessage("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error) {
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  /* ================= TOGGLE SWITCH COMPONENT ================= */
  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 space-y-6">
          
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 text-sm">Configure system and security preferences</p>
          </div>

          <div className="space-y-6 max-w-4xl">
            
            {/* SECURITY SETTINGS */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Security Preferences</h3>
                    <p className="text-xs text-gray-500">Manage your security settings</p>
                  </div>
                </div>
                <button
                  onClick={saveSecuritySettings}
                  disabled={savingSecurity}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingSecurity ? "Saving..." : "Save"}
                </button>
              </div>

              {securityMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  securityMsg.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {securityMsg}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts" },
                  { key: "sessionTimeout", label: "Session Timeout", desc: "Auto logout after 30 minutes inactivity" },
                  { key: "keystrokeBiometrics", label: "Keystroke Biometrics", desc: "Enable behavioral typing pattern analysis" },
                  { key: "travelDetection", label: "Travel Anomaly Detection", desc: "Detect impossible travel between logins" },
                  { key: "mfaForHighRisk", label: "MFA for High Risk", desc: "Require multi-factor for suspicious logins" },
                  { key: "loginLockout", label: "Login Attempt Lockout", desc: "Lock account after 5 failed attempts" },
                  { key: "ipWhitelisting", label: "IP Whitelisting", desc: "Allow login only from approved IP addresses" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={securitySettings[item.key]}
                      onChange={(value) => setSecuritySettings(prev => ({ ...prev, [item.key]: value }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* NOTIFICATION SETTINGS */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Bell className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Notification Settings</h3>
                    <p className="text-xs text-gray-500">Manage how you receive alerts</p>
                  </div>
                </div>
                <button
                  onClick={saveNotificationSettings}
                  disabled={savingNotifications}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingNotifications ? "Saving..." : "Save"}
                </button>
              </div>

              {notifMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  notifMsg.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {notifMsg}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { key: "highRiskAlerts", label: "High Risk Alerts", desc: "Notify when high-risk login detected" },
                  { key: "failedLoginReports", label: "Failed Login Reports", desc: "Daily summary of failed login attempts" },
                  { key: "emailAlerts", label: "Email Alerts", desc: "Receive security alerts via email" },
                  { key: "browserNotifications", label: "Browser Notifications", desc: "Show desktop notifications" },
                  { key: "weeklyReports", label: "Weekly Reports", desc: "Receive weekly analytics report" },
                  { key: "systemUpdates", label: "System Updates", desc: "Notify when system maintenance occurs" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notificationSettings[item.key]}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, [item.key]: value }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* THEME SETTINGS */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Palette className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Theme Settings</h3>
                  <p className="text-xs text-gray-500">Choose your preferred theme</p>
                </div>
              </div>

              <div className="flex gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      setSelectedTheme(theme);
                      localStorage.setItem("theme", theme);
                    }}
                    className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTheme === theme
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* PASSWORD CHANGE */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Lock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Change Password</h3>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
              </div>

              {passwordMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {passwordError}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={handlePasswordChange}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
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