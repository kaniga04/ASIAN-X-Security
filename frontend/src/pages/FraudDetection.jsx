import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 12
};

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

/* ================= COMPONENT ================= */

const FraudDetection = () => {

  const [countries, setCountries] = useState([]);
  const [ips, setIps] = useState([]);

  const [riskDistribution, setRiskDistribution] = useState([
    { name: "Low Risk", value: 0 },
    { name: "Medium Risk", value: 0 },
    { name: "High Risk", value: 0 }
  ]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {

    fetchCountries();
    fetchTopIPs();

    // 🔥 Connect to backend socket
    const socket = io("http://localhost:5000");

    // 🔥 Listen for real-time attacks
    socket.on("attackDetected", (data) => {

      console.log("🚨 New Attack Detected:", data);

      // refresh dashboard data instantly
      fetchCountries();
      fetchTopIPs();

    });

    return () => socket.disconnect();

  }, []);

  /* ================= ATTACK COUNTRIES ================= */

  const fetchCountries = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/fraud/attack-countries"
      );

      const formatted = res.data.map(item => ({
        country: item._id || "Unknown",
        attacks: item.attacks
      }));

      setCountries(formatted);

    } catch (error) {

      console.error("Error fetching countries:", error);

    }

  };

  /* ================= TOP ATTACKING IPS ================= */

  const fetchTopIPs = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/fraud/top-ips"
      );

      const data = res.data;

      const formatted = data.map(item => ({
        ip: item._id,
        attempts: item.attempts
      }));

      setIps(formatted);

      // 🔥 Risk classification
      let low = 0;
      let medium = 0;
      let high = 0;

      data.forEach(item => {

        if (item.attempts < 5) low++;
        else if (item.attempts < 10) medium++;
        else high++;

      });

      setRiskDistribution([
        { name: "Low Risk", value: low },
        { name: "Medium Risk", value: medium },
        { name: "High Risk", value: high }
      ]);

    } catch (error) {

      console.error("Error fetching IPs:", error);

    }

  };

  /* ================= UI ================= */

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Fraud Detection Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI‑based login anomaly monitoring dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Risk Classification
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>

                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />

              </PieChart>
            </ResponsiveContainer>

          </div>

          {/* Top Attacking IPs */}
          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Top Attacking IPs
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ips}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="ip" />
                <YAxis />

                <Tooltip contentStyle={tooltipStyle} />

                <Bar
                  dataKey="attempts"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* Attack Source Countries */}
          <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">

            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Attack Sources by Country
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countries}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="country" />
                <YAxis />

                <Tooltip contentStyle={tooltipStyle} />

                <Bar
                  dataKey="attacks"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default FraudDetection;