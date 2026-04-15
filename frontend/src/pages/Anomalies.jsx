import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Anomalies() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    actionTaken: "",
    threatType: "",
    notes: ""
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );

      const anomalyData = res.data.filter(
        log => log.isAnomaly && !log.resolved
      );

      setLogs(anomalyData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPEN MODAL =====
  const openResolveModal = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // ===== SUBMIT =====
  const handleResolve = async () => {
    try {

      await axios.put(
        `https://asian-x-security.onrender.com/api/cases/resolve/${selectedLog._id}`,
        form
      );

      setShowModal(false);
      fetchLogs();

    } catch (error) {
      console.error(error);
      alert("Resolve failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6">

          <h2 className="text-xl font-bold mb-4">
            Anomaly Detection
          </h2>

          <table className="w-full bg-white shadow rounded">

            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">IP</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-t">

                  <td className="p-3">{log.email}</td>
                  <td className="p-3">{log.ipAddress}</td>
                  <td className="p-3">{log.riskScore}</td>

                  <td className="p-3">
                    <button
                      onClick={() => openResolveModal(log)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Resolve
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </main>
      </div>

      {/* ================= MODAL ================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white p-6 rounded-lg w-[500px]">

            <h3 className="text-lg font-bold mb-4">
              Resolve Anomaly
            </h3>

            <p className="text-sm mb-2">
              User: {selectedLog.email}
            </p>

            {/* ACTION */}
            <select
              className="w-full border p-2 mb-3"
              onChange={(e) =>
                setForm({ ...form, actionTaken: e.target.value })
              }
            >
              <option>Select Action</option>
              <option>False Positive</option>
              <option>Block IP</option>
              <option>Password Reset</option>
              <option>Account Lock</option>
            </select>

            {/* THREAT TYPE */}
            <select
              className="w-full border p-2 mb-3"
              onChange={(e) =>
                setForm({ ...form, threatType: e.target.value })
              }
            >
              <option>Select Threat Type</option>
              <option>Brute Force</option>
              <option>Credential Stuffing</option>
              <option>Suspicious Location</option>
            </select>

            {/* NOTES */}
            <textarea
              placeholder="Investigation notes..."
              className="w-full border p-2 mb-3"
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleResolve}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Apply & Resolve
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Anomalies;