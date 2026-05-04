import React from 'react';

const RiskChart = ({ logs = [] }) => {
  // Safe check for logs array
  const safeLogs = Array.isArray(logs) ? logs : [];
  
  const riskCounts = {
    Low: safeLogs.filter(l => l?.riskLevel === 'Low' || (l?.riskScore || 0) < 30).length,
    Medium: safeLogs.filter(l => l?.riskLevel === 'Medium' || ((l?.riskScore || 0) >= 30 && (l?.riskScore || 0) < 60)).length,
    High: safeLogs.filter(l => l?.riskLevel === 'High' || ((l?.riskScore || 0) >= 60 && (l?.riskScore || 0) < 80)).length,
    Critical: safeLogs.filter(l => l?.riskLevel === 'Critical' || (l?.riskScore || 0) >= 80).length,
  };

  const total = safeLogs.length || 1;
  
  const colors = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500'
  };

  return (
    <div className="space-y-4">
      {Object.entries(riskCounts).map(([level, count]) => (
        <div key={level}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{level}</span>
            <span className="font-medium">{count}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${colors[level]} h-3 rounded-full transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskChart;