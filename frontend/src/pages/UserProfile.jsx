import React from "react";
import UserSidebar from "../components/UserSidebar";
import Topbar from "../components/Topbar";

function UserProfile() {
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ✅ USER SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6">

          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg">

            <h2 className="text-xl font-semibold mb-4">
              My Profile
            </h2>

            <div className="space-y-3 text-sm">

              <p>
                <b>Name:</b> {user?.name}
              </p>

              <p>
                <b>Email:</b> {user?.email}
              </p>

              <p>
                <b>Role:</b> {user?.role}
              </p>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}

export default UserProfile;