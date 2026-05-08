import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { User, Mail, Shield, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, Activity, Brain, Phone, Building } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : "https://asian-x-security.onrender.com/api";

function Profile() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", department: "" });
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false });
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || ""
      });
      fetchTrainingStatus(user.id || user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FETCH TRAINING STATUS ================= */
  const fetchTrainingStatus = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE}/auth/training-status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainingStatus(res.data);
    } catch (error) {
      console.log("Training status not available");
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setUpdateMsg("");
    setUpdateError("");
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordMsg("");
    setPasswordError("");
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async () => {
    if (!form.name.trim()) {
      setUpdateError("Name is required");
      return;
    }

    setLoading(true);
    setUpdateMsg("");
    setUpdateError("");

    try {
      await axios.put(`${API_BASE}/auth/update-profile`, form, {
    headers: { Authorization: `Bearer ${token}` }
});

      localStorage.setItem("user", JSON.stringify({ 
        ...JSON.parse(localStorage.getItem("user") || "{}"), 
        ...form 
      }));

      setUpdateMsg("✅ Profile updated successfully!");
      setTimeout(() => setUpdateMsg(""), 3000);
    } catch (err) {
      setUpdateError("❌ Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handlePasswordUpdate = async () => {
    setPasswordMsg("");
    setPasswordError("");

    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordMsg("✅ Password changed successfully!");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPasswordMsg(""), 3000);
    } catch (err) {
      setPasswordError("❌ Failed to change password. Check your current password.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 space-y-6">
          
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-500 text-sm">Manage your account and security settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white font-bold">
                  {form.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-800">{form.name || "User"}</h2>
              <p className="text-sm text-gray-500">{form.email}</p>

              <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full mt-3 font-medium">
                Administrator
              </span>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {form.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <Shield className="w-4 h-4 text-green-500" />
                  Two-Factor Authentication
                  <span className="ml-auto text-green-600 text-xs font-medium">Enabled</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Last Login
                  <span className="ml-auto text-gray-500 text-xs">Recently</span>
                </div>
              </div>
            </div>

            {/* EDIT PROFILE + PASSWORD */}
            <div className="lg:col-span-2 space-y-6">

              {/* PERSONAL INFO */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-xs text-gray-500">Update your personal details</p>
                  </div>
                </div>

                {updateMsg && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {updateMsg}
                  </div>
                )}
                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {updateError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Full Name</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="email"
                        value={form.email}
                        readOnly
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Phone</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Department</label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>

              {/* BEHAVIORAL TRAINING STATUS */}
              {trainingStatus && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Behavioral Model Status</h3>
                      <p className="text-xs text-gray-500">Your typing pattern training progress</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Training Samples</span>
                      <span className="font-bold text-lg">{trainingStatus.sampleCount || 0}/20</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Model Progress</span>
                        <span className="font-medium">{trainingStatus.trainingStatus?.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (trainingStatus.trainingStatus?.progress || 0) >= 80 ? 'bg-green-500' :
                            (trainingStatus.trainingStatus?.progress || 0) >= 40 ? 'bg-yellow-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${trainingStatus.trainingStatus?.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Status</p>
                        <p className="font-semibold text-gray-800">{trainingStatus.trainingStatus?.level || 'Initializing'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Confidence</p>
                        <p className="font-semibold text-gray-800">{trainingStatus.trainingStatus?.confidence || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHANGE PASSWORD */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Change Password</h3>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                </div>

                {passwordMsg && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {passwordMsg}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {passwordError}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword.current ? "text" : "password"}
                      name="current"
                      placeholder="Current Password"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword.newPass ? "text" : "password"}
                      name="newPass"
                      placeholder="New Password"
                      value={passwordForm.newPass}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, newPass: !prev.newPass }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    onClick={handlePasswordUpdate}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ================= LOCK ICON COMPONENT ================= */
const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default Profile;