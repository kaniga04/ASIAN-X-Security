import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { Eye, UserX, Trash2 } from "lucide-react";

function Users() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ================= FETCH USERS =================

  const fetchUsers = useCallback(async () => {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/auth/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(res.data);

    } catch (err) {

      console.error("Error fetching users:", err);

    } finally {

      setLoading(false);

    }
  }, [token]);

  // ================= USE EFFECT =================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ================= DELETE USER =================

  const deleteUser = async (id) => {

    if (!window.confirm("Delete this user permanently?")) return;

    try {

      await axios.delete(
        `http://localhost:5000/api/auth/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(prev => prev.filter(user => user._id !== id));

    } catch (err) {

      console.error(err);
      alert("Failed to delete user");

    }

  };

  // ================= BLOCK USER =================

  const toggleBlock = async (id, isBlocked) => {

    try {

      await axios.put(
        `http://localhost:5000/api/auth/users/block/${id}`,
        { isBlocked: !isBlocked },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(prev =>
        prev.map(user =>
          user._id === id
            ? { ...user, isBlocked: !isBlocked }
            : user
        )
      );

    } catch (err) {

      console.error(err);
      alert("Failed to update user");

    }

  };

  // ================= SEARCH =================

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // ================= PAGINATION =================

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;

  const currentUsers = filteredUsers.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6">

          <h2 className="text-2xl font-bold mb-6">
            User Management
          </h2>

          {/* CARD */}

          <div className="bg-white rounded-xl shadow-sm border">

            {/* SEARCH BAR */}

            <div className="p-4 border-b">

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* TABLE */}

            <table className="w-full text-sm text-left">

              <thead className="text-gray-500 uppercase text-xs border-b">

                <tr>

                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>

                </tr>

              </thead>

              <tbody>

                {currentUsers.map((user) => (

                  <tr key={user._id} className="border-b hover:bg-gray-50">

                    <td className="px-6 py-4 font-medium">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {user.email}
                    </td>

                    {/* ROLE */}

                    <td className="px-6 py-4">

                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                      
                      ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : user.role === "analyst"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>

                        {user.role}

                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                      
                      ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>

                        {user.isBlocked ? "Blocked" : "Active"}

                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4 flex justify-center gap-4">

                      <button className="text-gray-500 hover:text-blue-600">
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          toggleBlock(user._id, user.isBlocked)
                        }
                        className="text-gray-500 hover:text-yellow-600"
                      >
                        <UserX size={18} />
                      </button>

                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {/* FOOTER */}

            <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-500">

              <p>
                Showing {currentUsers.length} of {filteredUsers.length} users
              </p>

              <div className="flex gap-2">

                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}

export default Users;