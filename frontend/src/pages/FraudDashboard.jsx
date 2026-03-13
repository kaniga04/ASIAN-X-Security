import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function FraudDashboard() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fraud/clusters");
      setClusters(res.data);
    } catch (error) {
      console.error("Error fetching fraud clusters:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
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
            Fraud Pattern Clustering Dashboard
          </h2>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">IP Address</th>
                    <th className="px-6 py-3">Attempts</th>
                    <th className="px-6 py-3">Affected Accounts</th>
                    <th className="px-6 py-3">Countries</th>
                    <th className="px-6 py-3">Last Attempt</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {clusters.map((cluster, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {cluster.ipAddress}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold">
                        {cluster.attempts}
                      </td>
                      <td className="px-6 py-4">
                        {cluster.affectedAccountsCount}
                      </td>
                      <td className="px-6 py-4">
                        {cluster.countries.join(", ")}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(cluster.lastAttempt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {clusters.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No fraud clusters detected.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FraudDashboard;