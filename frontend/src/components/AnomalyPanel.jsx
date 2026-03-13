import React from "react";

const AnomalyPanel = ({ logs }) => {
  const anomalies = logs.filter(l => l.isAnomaly);

  return (
    <div className="anomaly-section">
      <h3>Detected Anomalies</h3>

      {anomalies.length === 0 ? (
        <p>No anomalies detected</p>
      ) : (
        anomalies.map((a, index) => (
          <div key={index} className="anomaly-card">
            <p><strong>User:</strong> {a.email}</p>
            <p><strong>Risk Score:</strong> {a.riskScore}</p>
            <p><strong>IP:</strong> {a.ipAddress}</p>
            <p><strong>Status:</strong> {a.status}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AnomalyPanel;
