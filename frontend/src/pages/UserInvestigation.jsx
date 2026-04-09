import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function UserInvestigation() {

  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);

  const fetchUserData = async () => {
    try {

      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );

      const userLogs = res.data.filter(
        log => log.email.toLowerCase() === email.toLowerCase()
      );

      setLogs(userLogs);

      generateReport(userLogs);

    } catch (error) {
      console.error(error);
    }
  };

  const generateReport = (logs) => {

    if (logs.length === 0) return;

    const highRisk = logs.filter(l => l.riskScore >= 70);

    const countries = [...new Set(logs.map(l => l.country))];

    const ips = [...new Set(
      logs.map(l => l.ipAddress?.split(",")[0].trim())
    )];

    const avgRisk =
      logs.reduce((sum, l) => sum + l.riskScore, 0) / logs.length;

    const riskLevel =
      avgRisk >= 70
        ? "High"
        : avgRisk >= 40
        ? "Medium"
        : "Low";

    setReport({
      total: logs.length,
      highRisk: highRisk.length,
      countries,
      ips,
      avgRisk: avgRisk.toFixed(1),
      riskLevel
    });

  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          <div>
            <h2 className="text-2xl font-bold">
              User Risk Investigation
            </h2>
            <p className="text-gray-500">
              Analyze specific user login behavior
            </p>
          </div>

          {/* Search */}
          <div className="bg-white p-6 rounded-xl shadow">

            <div className="flex gap-4">

              <input
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded-lg w-full"
              />

              <button
                onClick={fetchUserData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Analyze
              </button>

            </div>

          </div>

          {/* Report */}
          {report && (

            <div className="bg-white p-6 rounded-xl shadow space-y-4">

              <h3 className="text-lg font-semibold">
                Risk Report
              </h3>

              <div className="grid grid-cols-3 gap-4">

                <div className="bg-gray-100 p-4 rounded">
                  Total Logins
                  <div className="text-xl font-bold">
                    {report.total}
                  </div>
                </div>

                <div className="bg-red-100 p-4 rounded">
                  High Risk
                  <div className="text-xl font-bold">
                    {report.highRisk}
                  </div>
                </div>

                <div className="bg-yellow-100 p-4 rounded">
                  Avg Risk
                  <div className="text-xl font-bold">
                    {report.avgRisk}
                  </div>
                </div>

              </div>

              <div>
                <strong>Risk Level:</strong>{" "}
                <span className="text-red-600 font-bold">
                  {report.riskLevel}
                </span>
              </div>

              <div>
                <strong>Countries Used:</strong>
                <div>
                  {report.countries.join(", ")}
                </div>
              </div>

              <div>
                <strong>IP Changes:</strong>
                <div>
                  {report.ips.length} IP addresses
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 p-4 rounded">

                <strong>Security Recommendations</strong>

                <ul className="list-disc ml-6 mt-2">

                  {report.riskLevel === "High" && (
                    <>
                      <li>Enable Multi Factor Authentication</li>
                      <li>Reset user password</li>
                      <li>Monitor suspicious logins</li>
                    </>
                  )}

                  {report.riskLevel === "Medium" && (
                    <>
                      <li>Monitor login activity</li>
                      <li>Check IP location changes</li>
                    </>
                  )}

                  {report.riskLevel === "Low" && (
                    <li>No major threats detected</li>
                  )}

                </ul>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default UserInvestigation;