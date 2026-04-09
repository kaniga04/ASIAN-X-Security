import React from "react";

const AnomalyPanel = ({ logs }) => {

  const anomalies = logs?.filter(l => l.isAnomaly) || [];

  return (
    <div className="p-4 bg-white rounded-xl shadow">

      <h3 className="text-lg font-semibold mb-4">
        🚨 Detected Anomalies
      </h3>

      {anomalies.length === 0 ? (
        <p className="text-gray-500">No anomalies detected</p>
      ) : (
        <div className="space-y-3">
          {anomalies.map((a, index) => (
            <div
              key={index}
              className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm"
            >
              <p><strong>User:</strong> {a.email}</p>

              <p>
                <strong>Risk Score:</strong>{" "}
                <span className={`px-2 py-1 text-xs rounded 
                  ${a.riskScore >= 80 ? "bg-red-200 text-red-700" :
                    a.riskScore >= 50 ? "bg-yellow-200 text-yellow-700" :
                    "bg-green-200 text-green-700"}`}>
                  {a.riskScore}
                </span>
              </p>

              <p>
                <strong>IP:</strong>{" "}
                {a.ipAddress?.split(",")[0].trim()}
              </p>

              <p><strong>Status:</strong> {a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnomalyPanel;