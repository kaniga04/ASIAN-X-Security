import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  User,
  Mail,
  Shield,
  Key
} from "lucide-react";

function Profile() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: ""
  });

  /* ✅ LOAD USER DATA */
  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || ""
      });
    }
  }, []);

  /* ✅ HANDLE INPUT */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ✅ UPDATE PROFILE */
  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        "https://asian-x-security.onrender.com/api/auth/update-profile",
        form
      );

      alert("Profile updated ✅");

      localStorage.setItem("user", JSON.stringify(res.data.user));

    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-gray-500 text-sm">
              Manage your account and security settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* PROFILE CARD */}
            <div className="bg-white rounded-xl shadow p-6 text-center">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold">
                {form.name || "User"}
              </h2>

              <p className="text-sm text-gray-500">
                {form.email}
              </p>

              <span className="inline-block bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full mt-3">
                Admin
              </span>

              <div className="mt-6 space-y-3 text-left">

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} />
                  {form.email}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={16} />
                  2FA Enabled
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Key size={16} />
                  Last login: Recently
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
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Email
                    </label>
                    <input
  name="email"
  value={form.email}
  readOnly
  className="w-full border rounded-md px-3 py-2 mt-1 text-sm bg-gray-100 cursor-not-allowed"
/>
<p className="text-xs text-gray-400 mt-1">
  Email cannot be changed
</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Department
                    </label>
                    <input
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                </div>

                <button
                  onClick={handleUpdate}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Update Profile
                </button>

              </div>

              {/* CHANGE PASSWORD (UI only for now) */}
              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="text-sm font-semibold mb-4">
                  Change Password
                </h3>

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
                    placeholder="Confirm Password"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

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