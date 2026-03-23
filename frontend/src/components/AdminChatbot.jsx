import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Welcome Admin. AI Security Assistant is online." }
  ]);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([]);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("https://asian-x-security.onrender.com/api/auth/login");
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, []);

  // 🧠 Risk Scoring Engine
  const calculateRiskScore = () => {
    if (!logs.length) return 0;

    const failed = logs.filter(l => l.status === "failed").length;
    const highRisk = logs.filter(l => l.risk === "High").length;
    const anomalies = logs.filter(l => l.isAnomaly === true).length;

    let score = (failed * 2) + (highRisk * 5) + (anomalies * 4);

    return score;
  };

  const getRiskLevel = (score) => {
    if (score > 50) return "🔴 HIGH RISK";
    if (score > 20) return "🟡 MODERATE RISK";
    return "🟢 LOW RISK";
  };

  // 🧠 Smart Intent Detection
  const detectIntent = (question) => {
    const q = question.toLowerCase();

    if (q.match(/top|highest|most/) && q.match(/ip|attacker/))
      return "TOP_IP";

    if (q.match(/failed|unsuccessful/))
      return "FAILED";

    if (q.match(/risk|safe|secure|status/))
      return "STATUS";

    if (q.match(/anomal|suspicious/))
      return "ANOMALY";

    if (q.match(/summary|report|overview/))
      return "SUMMARY";

    return "UNKNOWN";
  };

  // 🔥 Intelligent Response Generator
  const generateResponse = (intent) => {
    if (!logs.length)
      return "Fraud data is currently unavailable.";

    const riskScore = calculateRiskScore();
    const riskLevel = getRiskLevel(riskScore);

    switch (intent) {

      case "TOP_IP":
        const ipCount = {};
        logs.forEach(log => {
          ipCount[log.ip] = (ipCount[log.ip] || 0) + 1;
        });

        const sortedIPs = Object.entries(ipCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        return `🚨 Top Attacking IPs:
${sortedIPs.map(ip => `${ip[0]} → ${ip[1]} attempts`).join("\n")}

System Risk Level: ${riskLevel}`;

      case "FAILED":
        const failed = logs.filter(l => l.status === "failed").length;
        return `❌ Total Failed Login Attempts: ${failed}
Current Risk Status: ${riskLevel}`;

      case "ANOMALY":
        const anomalies = logs.filter(l => l.isAnomaly === true).length;
        return `🔎 Detected ${anomalies} anomalies in system logs.
Security Status: ${riskLevel}`;

      case "STATUS":
        return `📊 Enterprise Security Status:

Risk Score: ${riskScore}
Risk Level: ${riskLevel}
Total Logs: ${logs.length}

Recommendation:
${riskScore > 50
  ? "Immediate investigation required."
  : riskScore > 20
  ? "Monitor suspicious activities."
  : "System operating normally."}`;

      case "SUMMARY":
        const failedCount = logs.filter(l => l.status === "failed").length;
        const highRiskCount = logs.filter(l => l.risk === "High").length;

        return `📈 Fraud Intelligence Summary:

Total Logs: ${logs.length}
Failed Attempts: ${failedCount}
High Risk Events: ${highRiskCount}
Overall Risk Level: ${riskLevel}

AI Insight:
${highRiskCount > 5
  ? "Repeated high-risk attempts detected. Possible brute-force pattern."
  : "No severe threat patterns identified."}`;

      default:
        return "I can assist with system status, fraud summary, top attackers, risk level, and anomaly detection.";
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const intent = detectIntent(input);
    const reply = generateResponse(intent);

    const botMessage = { sender: "bot", text: reply };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer text-2xl"
      >
        🤖
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">

          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center font-semibold">
            Enterprise AI Security Assistant
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-xs whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-indigo-500 text-white ml-auto"
                    : "bg-gray-300 text-black"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex border-t">
            <input
              type="text"
              placeholder="Ask about system security..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 p-2 outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 text-white px-4 hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminChatbot;