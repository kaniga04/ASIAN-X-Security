import React from "react";
import { Users, LogIn, AlertTriangle, ShieldAlert, XCircle } from "lucide-react";

const SummaryCards = ({ logs, users }) => {

  const totalUsers = users.length;
  const totalLogins = logs.length;
  const anomalies = logs.filter((l) => l.isAnomaly).length;
  const failed = logs.filter((l) => l.status === "failed").length;
  const highRisk = logs.filter((l) => l.riskScore >= 70).length;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users size={28} />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Total Logins",
      value: totalLogins,
      icon: <LogIn size={28} />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Failed Logins",
      value: failed,
      icon: <XCircle size={28} />,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "Detected Anomalies",
      value: anomalies,
      icon: <AlertTriangle size={28} />,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "High Risk Accounts",
      value: highRisk,
      icon: <ShieldAlert size={28} />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition"
        >
          
          <div>
            <p className="text-sm text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {card.value}
            </h3>
          </div>

          <div
            className={`p-3 rounded-lg ${card.color}`}
          >
            {card.icon}
          </div>

        </div>
      ))}

    </div>
  );
};

export default SummaryCards;