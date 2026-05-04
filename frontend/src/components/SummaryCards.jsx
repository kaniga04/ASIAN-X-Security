import React from 'react';
import { Users, Activity, AlertTriangle, Shield } from 'lucide-react';

const SummaryCards = ({ logs, users }) => {
  // EXTREME SAFETY CHECKS
  const logsArray = logs && Array.isArray(logs) ? logs : [];
  const usersArray = users && Array.isArray(users) ? users : [];
  
  const totalLogins = logsArray.length;
  const highRiskLogins = logsArray.filter(l => l && (l.riskScore || 0) >= 70).length;
  const anomalies = logsArray.filter(l => l && l.isAnomaly === true).length;
  const totalUsers = usersArray.length;

  const cards = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Logins', value: totalLogins, icon: Activity, color: 'bg-green-500' },
    { label: 'High Risk', value: highRiskLogins, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Anomalies', value: anomalies, icon: Shield, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;