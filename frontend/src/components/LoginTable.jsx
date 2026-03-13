import React from "react";

function LoginTable({ logs }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">IP</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Risk Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logs.slice(0, 5).map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{log.email}</td>
              <td className="px-4 py-2">{log.ipAddress || "N/A"}</td>

              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    log.status === "success"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {log.status}
                </span>
              </td>

              <td className="px-4 py-2 font-medium">
                {log.riskScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoginTable;
