import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Campaigns() {

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/cases/campaigns"
      );

      setCampaigns(res.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Resolve ALL logs for this IP
  const resolveAll = async (ip) => {
    try {
      await axios.put(
        "https://asian-x-security.onrender.com/api/cases/resolve-all",
        { ipAddress: ip }
      );

      fetchCampaigns();

    } catch (error) {
      console.error(error);
    }
  };

  // 🚫 Block IP (frontend demo only)
  const blockIP = (ip) => {
    alert(`IP ${ip} blocked 🚫`);
  };

  // 📄 Export report
  const exportReport = (c) => {
    const text = `
Attack Campaign Report
----------------------
IP: ${c.ipAddress}
Users: ${c.affectedUsers.join(", ")}
Count: ${c.attackCount}
Time: ${new Date(c.firstSeen).toLocaleString()} - ${new Date(c.lastSeen).toLocaleString()}
    `;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "campaign-report.txt";
    a.click();
  };

  if (loading) {
    return <div className="p-6">Loading campaigns...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-6 space-y-6">

          <h2 className="text-2xl font-bold">
            Attack Campaign Detection
          </h2>

          {campaigns.length === 0 && (
            <p className="text-gray-500">
              No attack campaigns detected
            </p>
          )}

          {campaigns.map((c, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow border"
            >

              <p><b>IP:</b> {c.ipAddress}</p>
              <p><b>Affected Users:</b> {c.affectedUsers.length}</p>
              <p><b>Attack Count:</b> {c.attackCount}</p>

              <p>
                <b>Time:</b>{" "}
                {new Date(c.firstSeen).toLocaleString()} -{" "}
                {new Date(c.lastSeen).toLocaleString()}
              </p>

              {/* 🔥 ACTION BUTTONS */}
              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => resolveAll(c.ipAddress)}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  Resolve All
                </button>

                <button
                  onClick={() => blockIP(c.ipAddress)}
                  className="bg-red-600 text-white px-3 py-2 rounded"
                >
                  Block IP
                </button>

                <button
                  onClick={() => exportReport(c)}
                  className="bg-blue-600 text-white px-3 py-2 rounded"
                >
                  Export Report
                </button>

              </div>

            </div>
          ))}

        </main>

      </div>
    </div>
  );
}

export default Campaigns;