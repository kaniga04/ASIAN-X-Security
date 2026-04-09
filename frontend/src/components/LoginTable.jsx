import React from "react";

function LoginTable({ logs }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">

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

          {(!logs || logs.length === 0) ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No login data available
              </td>
            </tr>
          ) : (
            logs.slice(0, 5).map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">

                <td className="px-4 py-2">{log.email}</td>

                <td className="px-4 py-2">
                  {log.ipAddress?.split(",")[0].trim() || "N/A"}
                </td>

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

                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${log.riskScore >= 80 ? "bg-red-200 text-red-700" :
                      log.riskScore >= 50 ? "bg-yellow-200 text-yellow-700" :
                      "bg-green-200 text-green-700"}`}>
                    {log.riskScore}
                  </span>
                </td>

              </tr>
            ))
          )}

        </tbody>
      </table>

    </div>
  );
}

export default LoginTable;