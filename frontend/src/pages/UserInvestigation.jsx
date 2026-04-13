import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function UserInvestigation() {

  const [email, setEmail] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      const res = await axios.get(
        "https://asian-x-security.onrender.com/api/auth/logs"
      );

      const userLogs = res.data.filter(
        log => log.email.toLowerCase() === email.toLowerCase()
      );

      if (userLogs.length === 0) {
        setError("No data found for this user");
        return;
      }

      generateReport(userLogs);

    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (logs) => {

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

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-bold">
              User Risk Investigation
            </h2>
            <p className="text-gray-500">
              Analyze user behavior and detect suspicious activity
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="bg-white p-6 rounded-xl shadow">

            <div className="flex gap-4">

              <input
                type="email"
                placeholder="Enter user email (e.g. user@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                onClick={fetchUserData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>

            </div>

            {error && (
              <p className="text-red-500 mt-3 text-sm">{error}</p>
            )}

          </div>

          {/* REPORT */}
          {report && (

            <div className="bg-white p-6 rounded-xl shadow space-y-6">

              <h3 className="text-lg font-semibold">
                Risk Report
              </h3>

              {/* CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Logins</p>
                  <div className="text-2xl font-bold">
                    {report.total}
                  </div>
                </div>

                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">High Risk Events</p>
                  <div className="text-2xl font-bold text-red-700">
                    {report.highRisk}
                  </div>
                </div>

                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Average Risk</p>
                  <div className="text-2xl font-bold text-yellow-700">
                    {report.avgRisk}
                  </div>
                </div>

              </div>

              {/* RISK LEVEL */}
              <div>
                <strong>Risk Level:</strong>{" "}
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  report.riskLevel === "High"
                    ? "bg-red-200 text-red-800"
                    : report.riskLevel === "Medium"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-green-200 text-green-800"
                }`}>
                  {report.riskLevel}
                </span>
              </div>

              {/* COUNTRIES */}
              <div>
                <strong>Countries Used:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {report.countries.map((c, i) => (
                    <span key={i} className="bg-gray-200 px-3 py-1 rounded text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* IP LIST */}
              <div>
                <strong>IP Addresses ({report.ips.length}):</strong>
                <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                  {report.ips.map((ip, i) => (
                    <div key={i}>{ip}</div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDATIONS */}
              <div className="bg-blue-50 p-4 rounded-lg">

                <strong>Security Recommendations</strong>

                <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">

                  {report.riskLevel === "High" && (
                    <>
                      <li>Enable Multi-Factor Authentication (MFA)</li>
                      <li>Force password reset immediately</li>
                      <li>Block suspicious IP addresses</li>
                      <li>Investigate unusual login patterns</li>
                    </>
                  )}

                  {report.riskLevel === "Medium" && (
                    <>
                      <li>Monitor login activity closely</li>
                      <li>Verify unusual device or location changes</li>
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