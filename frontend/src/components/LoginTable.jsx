import React from 'react';

const LoginTable = ({ logs = [] }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  
  const getRiskBadge = (level) => {
    const colors = {
      Low: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      High: 'bg-orange-100 text-orange-700',
      Critical: 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  if (safeLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No login data available
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left text-gray-600">Email</th>
          <th className="px-4 py-3 text-left text-gray-600">Status</th>
          <th className="px-4 py-3 text-left text-gray-600">Risk</th>
          <th className="px-4 py-3 text-left text-gray-600">Time</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {safeLogs.slice(0, 10).map((log) => (
          <tr key={log._id || Math.random()} className="hover:bg-gray-50">
            <td className="px-4 py-3">{log.email || 'N/A'}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded-full text-xs ${
                log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {log.status || 'unknown'}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded-full text-xs ${getRiskBadge(log.riskLevel)}`}>
                {log.riskLevel || 'Low'}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500">
              {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LoginTable;