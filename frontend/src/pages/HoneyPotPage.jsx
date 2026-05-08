import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Download, FileText, User, Lock, CreditCard, AlertTriangle } from 'lucide-react';

const HoneyPotPage = () => {
  const navigate = useNavigate();
  const [isRealUser, setIsRealUser] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Track every interaction
  const trackInteraction = useCallback(async (action, details = '') => {
    try {
      await fetch(`${API_URL}/api/auth/honeypot/interaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          details,
          timestamp: new Date().toISOString(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.log('Tracking error:', error.message);
    }
  }, [API_URL]);

  // Track page load
  useEffect(() => {
    trackInteraction('page_loaded', 'HoneyPot page displayed');
  }, [trackInteraction]);

  // Fake data
  const fakeData = {
    users: [
      { name: 'John Smith', email: 'john.smith@bank.com', ssn: '***-**-1234', creditCard: '4532-****-****-7890', balance: '$45,230' },
      { name: 'Sarah Johnson', email: 'sarah.j@company.com', ssn: '***-**-5678', creditCard: '5412-****-****-3456', balance: '$78,100' },
      { name: 'Mike Williams', email: 'mike.w@corp.com', ssn: '***-**-9012', creditCard: '3782-****-****-1234', balance: '$12,450' },
      { name: 'Emily Davis', email: 'emily.d@enterprise.com', ssn: '***-**-3456', creditCard: '6011-****-****-5678', balance: '$92,300' },
    ],
    adminCredentials: { username: 'admin', password: '********' },
    apiKeys: ['sk_live_****_abcd1234', 'api_key_****_xyz5678'],
    serverInfo: { ip: '10.0.1.25', port: 3306, database: 'production_db' }
  };

  // Real user confirms
  const handleRealUser = async () => {
    setIsRealUser(true);
    await trackInteraction('real_user_verified', 'User confirmed this is not their data');
    setTimeout(() => navigate('/user/dashboard'), 1500);
  };

  // Suspicious action
  const handleSuspiciousAction = async (action) => {
    setShowWarning(true);
    await trackInteraction('suspicious_action', action);
    try {
      await fetch(`${API_URL}/api/auth/honeypot/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          alertType: 'HONEYPOT_TRIGGERED',
          action: action,
          email: JSON.parse(localStorage.getItem('user') || '{}')?.email
        })
      });
    } catch (error) {
      console.log('Alert sent');
    }
  };

  const handleDownload = async () => {
    await handleSuspiciousAction('download_attempted');
    alert('⚠️ Download initiated... (This is a simulated trap)');
  };

  const handleViewConfidential = async () => {
    await handleSuspiciousAction('viewed_confidential_data');
  };

  if (isRealUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Identity Verified</h2>
          <p className="text-gray-600 mb-4">You've been identified as the legitimate user.</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-green-400" />
          <h1 className="text-xl font-bold">🔒 Secure Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Logged in as: Administrator</span>
          <User className="w-5 h-5 text-blue-400" />
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 rounded-lg text-white text-left">
              <FileText className="w-4 h-4" /> Dashboard
            </button>
            <button onClick={() => handleSuspiciousAction('clicked_users')} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-lg text-left">
              <User className="w-4 h-4" /> Users
            </button>
            <button onClick={() => handleSuspiciousAction('clicked_finance')} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-lg text-left">
              <CreditCard className="w-4 h-4" /> Financial Records
            </button>
            <button onClick={handleDownload} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-lg text-green-400 text-left">
              <Download className="w-4 h-4" /> Export Data
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {showWarning && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">⚠️ Suspicious activity detected. Security team has been notified.</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: '12,847', color: 'text-blue-400' },
              { label: 'Revenue', value: '$4.2M', color: 'text-green-400' },
              { label: 'Active Sessions', value: '1,203', color: 'text-yellow-400' },
              { label: 'API Keys', value: '24', color: 'text-purple-400' }
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-lg">📊 User Database Records</h3>
              <p className="text-sm text-gray-400 mt-1">Confidential - Internal Use Only</p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">SSN</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Credit Card</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {fakeData.users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/30 cursor-pointer" onClick={handleViewConfidential}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4 text-blue-400">{user.email}</td>
                    <td className="px-6 py-4 font-mono text-yellow-400">{user.ssn}</td>
                    <td className="px-6 py-4 font-mono text-green-400">{user.creditCard}</td>
                    <td className="px-6 py-4 font-bold">{user.balance}</td>
                    <td className="px-6 py-4">
                      <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Export</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-lg">🔑 System Credentials</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span>Admin Username:</span>
                <span className="font-mono text-blue-400">{fakeData.adminCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Password:</span>
                <span className="font-mono text-green-400">{fakeData.adminCredentials.password}</span>
              </div>
              {fakeData.apiKeys.map((key, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span>API Key {i + 1}:</span>
                  <span className="font-mono text-yellow-400">{key}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span>Database Host:</span>
                <span className="font-mono text-purple-400">{fakeData.serverInfo.ip}:{fakeData.serverInfo.port}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-3">Don't recognize this data?</p>
            <button onClick={handleRealUser} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition">
              ✅ This is not my data - I'm the real user
            </button>
            <p className="text-gray-600 text-xs mt-2">Click if you're the legitimate account owner</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HoneyPotPage;