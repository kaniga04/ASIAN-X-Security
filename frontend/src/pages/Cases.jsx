import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cases`);
      setCases(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch cases error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (caseId) => {
    try {
      await axios.put(`${API_URL}/api/cases/${caseId}`, {
        status: "Resolved",
        actionTaken: "Manually resolved by admin",
        notes: "Case reviewed and resolved"
      });
      fetchCases(); // Refresh
    } catch (error) {
      console.error("Resolve error:", error);
    }
  };

  const filteredCases = cases.filter(c => {
    if (filter === "all") return true;
    if (filter === "open") return c.status === "Open";
    if (filter === "resolved") return c.status === "Resolved";
    if (filter === "critical") return c.severity === "Critical";
    return true;
  });

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "Critical": return "bg-red-100 text-red-700";
      case "High": return "bg-orange-100 text-orange-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
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
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Case Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                Security incident tracking and resolution
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-3">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-800">{cases.length}</p>
              </div>
              <div className="bg-red-50 rounded-lg px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-red-600">Open</p>
                <p className="text-xl font-bold text-red-700">
                  {cases.filter(c => c.status === "Open").length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-green-600">Resolved</p>
                <p className="text-xl font-bold text-green-700">
                  {cases.filter(c => c.status === "Resolved").length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {[
              { value: "all", label: "All Cases" },
              { value: "open", label: "Open" },
              { value: "resolved", label: "Resolved" },
              { value: "critical", label: "Critical" }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === btn.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Severity</th>
                  <th className="px-6 py-3 text-left">Action Taken</th>
                  <th className="px-6 py-3 text-left">Threat Type</th>
                  <th className="px-6 py-3 text-left">Risk Score</th>
                  <th className="px-6 py-3 text-left">Notes</th>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      No cases found
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{c.email}</td>

                      <td className="px-6 py-4">
                        {c.status === "Resolved" ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" /> Resolved
                          </span>
                        ) : c.status === "Open" ? (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <AlertTriangle className="w-4 h-4" /> Open
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" /> {c.status}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(c.severity)}`}>
                          {c.severity || "Medium"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {c.actionTaken || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {c.threatType ? (
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                            {c.threatType}
                          </span>
                        ) : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          (c.riskScore || 0) >= 70 ? "text-red-600" : 
                          (c.riskScore || 0) >= 40 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {c.riskScore || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="truncate text-gray-600 text-xs whitespace-pre-line">
                          {c.notes || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        {c.status !== "Resolved" && (
                          <button
                            onClick={() => handleResolve(c._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Cases;