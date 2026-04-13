import React, { useState } from "react";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function CSVAnalyzer() {

  const [highRisk, setHighRisk] = useState([]);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // HANDLE FILE
  const processFile = (file) => {
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        analyzeRisk(results.data);
      }
    });
  };

  // UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // DRAG DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // RISK ANALYSIS
  const analyzeRisk = (logs) => {
    const risky = logs.filter(log => Number(log.RiskScore) >= 70);
    setHighRisk(risky);
  };

  // EXPORT CSV
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

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-bold">
              CSV Risk Analyzer
            </h2>
            <p className="text-gray-500">
              Upload login logs CSV to detect high-risk activities
            </p>
          </div>

          {/* UPLOAD BOX */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`bg-white p-8 rounded-xl shadow border-2 border-dashed text-center transition ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <p className="text-gray-600 mb-3">
              Drag & Drop your CSV file here
            </p>

            <p className="text-sm text-gray-400 mb-4">
              or
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="fileUpload"
            />

            <label
              htmlFor="fileUpload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded"
            >
              Browse File
            </label>

            {fileName && (
              <p className="mt-4 text-sm text-green-600">
                ✅ {fileName} uploaded
              </p>
            )}
          </div>

          {/* EMPTY STATE */}
          {highRisk.length === 0 && fileName && (
            <div className="text-center text-gray-500">
              No high-risk activity found 🔒
            </div>
          )}

          {/* REPORT */}
          {highRisk.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  High Risk Report ({highRisk.length})
                </h3>

                <button
                  onClick={exportCSV}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Download CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border">

                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      {Object.keys(highRisk[0]).map((key) => (
                        <th key={key} className="p-3 text-left border">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {highRisk.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">

                        {Object.entries(row).map(([key, value], i) => (
                          <td key={i} className="p-3 border">

                            {/* Highlight RiskScore */}
                            {key === "RiskScore" ? (
                              <span className={`px-2 py-1 rounded text-xs ${
                                Number(value) >= 90
                                  ? "bg-red-200 text-red-800"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {value}
                              </span>
                            ) : (
                              value
                            )}

                          </td>
                        ))}

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default CSVAnalyzer;