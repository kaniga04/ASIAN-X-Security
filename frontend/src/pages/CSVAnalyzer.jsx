import React, { useState } from "react";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function CSVAnalyzer() {

  const [highRisk, setHighRisk] = useState([]);

  // Upload CSV
  const handleFileUpload = (e) => {

    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {

        analyzeRisk(results.data);
      }
    });

  };

  // Risk Analyzer
  const analyzeRisk = (logs) => {

    const risky = logs.filter(log => Number(log.RiskScore) >= 70);

    setHighRisk(risky);
  };

  // Export Filtered CSV
  const exportCSV = () => {

    if (highRisk.length === 0) {
      alert("No High Risk Data");
      return;
    }

    const headers = Object.keys(highRisk[0]).join(",");

    const csv = [
      headers,
      ...highRisk.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "high-risk-report.csv");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 space-y-6">

          <div>
            <h2 className="text-2xl font-bold">
              CSV Risk Analyzer
            </h2>

            <p className="text-gray-500">
              Upload login logs CSV to detect high risk users
            </p>
          </div>

          {/* Upload */}
          <div className="bg-white p-6 rounded-xl shadow">

            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="border p-3 rounded-lg"
            />

          </div>

          {/* Report */}
          {highRisk.length > 0 && (

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between mb-4">

                <h3 className="text-lg font-semibold">
                  High Risk Report
                </h3>

                <button
                  onClick={exportCSV}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Download Report
                </button>

              </div>

              <table className="w-full text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(highRisk[0]).map((key) => (
                      <th key={key} className="p-3 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {highRisk.map((row, index) => (
                    <tr key={index} className="border-t">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-3">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default CSVAnalyzer;