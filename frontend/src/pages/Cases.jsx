import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/cases"
      );

      setCases(res.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6">

          <h2 className="text-2xl font-bold mb-4">
            Case Management
          </h2>

          <div className="bg-white rounded-xl shadow border overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Action Taken</th>
                  <th className="px-6 py-3 text-left">Threat Type</th>
                  <th className="px-6 py-3 text-left">Notes</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">

                    <td className="px-6 py-4">{c.email}</td>

                    <td className="px-6 py-4">
                      {c.resolved ? (
                        <span className="text-green-600 font-medium">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-yellow-600">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {c.actionTaken || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {c.threatType || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {c.notes || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {new Date(c.updatedAt).toLocaleString()}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Cases;