import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function LoginLogs() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMitre, setSelectedMitre] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {

      const res = await axios.get("https://asian-x-security.onrender.com/api/auth/logs");

      setLogs(res.data);

    } catch (error) {

      console.error("Error fetching logs:", error);

    } finally {

      setLoading(false);

    }
  };



  // ---------- DATE FORMAT ----------
  const formatDate = (date) => {

    if (!date) return "N/A";

    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    };

    return new Date(date).toLocaleString("en-US", options);

  };



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
            Login Activity Logs
          </h2>


          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm text-left">

                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>

                    <th className="px-6 py-3">Email</th>

                    <th className="px-6 py-3">Role</th>

                    <th className="px-6 py-3">IP Address</th>

                    <th className="px-6 py-3">Status</th>

                    <th className="px-6 py-3">Risk Score</th>

                    <th className="px-6 py-3">Anomaly</th>

                    <th className="px-6 py-3">MITRE</th>

                    <th className="px-6 py-3">Login Time</th>

                  </tr>
                </thead>



                <tbody className="divide-y">

                  {logs.map((log) => (

                    <tr
                      key={log._id}
                      className={`hover:bg-gray-50 ${
                        log.isAnomaly ? "bg-red-50" : ""
                      }`}
                    >

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {log.email}
                      </td>


                      <td className="px-6 py-4">

                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {log.role || "Guest"}
                        </span>

                      </td>


                      <td className="px-6 py-4">
                        {log.ipAddress}
                      </td>



                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {log.status}

                        </span>

                      </td>



                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.riskScore >= 70
                              ? "bg-red-100 text-red-700"
                              : log.riskScore >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >

                          {log.riskScore}

                        </span>

                      </td>



                      <td className="px-6 py-4">

                        {log.isAnomaly ? (

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Yes
                          </span>

                        ) : (

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            No
                          </span>

                        )}

                      </td>



                      {/* MITRE COLUMN */}

                      <td className="px-6 py-4">

                        {log.mitreTactic ? (

                          <button
                            onClick={() => setSelectedMitre(log)}
                            className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200"
                          >

                            {log.mitreTactic}

                          </button>

                        ) : (

                          "—"

                        )}

                      </td>



                      <td className="px-6 py-4">

                        {formatDate(log.createdAt)}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>



              {logs.length === 0 && (

                <div className="p-8 text-center text-gray-500">
                  No login records available.
                </div>

              )}

            </div>

          </div>

        </main>

      </div>



      {/* MITRE MODAL */}

      {selectedMitre && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white w-[500px] rounded-xl shadow-lg p-6">

            <h3 className="text-lg font-bold mb-4">
              MITRE ATT&CK Analysis
            </h3>

            <div className="space-y-3 text-sm">

              <p>
                <b>Tactic:</b> {selectedMitre.mitreTactic}
              </p>

              <p>
                <b>Technique:</b> {selectedMitre.mitreTechnique}
              </p>

              <p>
                <b>Status:</b> {selectedMitre.status}
              </p>

              <p>
                <b>Risk Score:</b> {selectedMitre.riskScore}
              </p>

              <p>
                <b>Anomaly:</b> {selectedMitre.isAnomaly ? "Yes" : "No"}
              </p>

              <hr />

              <p className="text-gray-600">

                This login event triggered anomaly detection due to unusual
                behaviour such as new IP address, multiple failed attempts,
                or suspicious login timing.

                The MITRE ATT&CK framework maps this activity to a known
                adversary tactic and technique used in real cyber attacks.

              </p>

            </div>


            <div className="flex justify-end mt-6">

              <button
                onClick={() => setSelectedMitre(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default LoginLogs;