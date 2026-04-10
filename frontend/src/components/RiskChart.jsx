import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function RiskChart({ logs = [] }) {

  const safeLogs = logs || [];

  const lowRisk = safeLogs.filter(l => (l.riskScore || 0) < 30).length;
  const mediumRisk = safeLogs.filter(
    l => (l.riskScore || 0) >= 30 && (l.riskScore || 0) < 70
  ).length;
  const highRisk = safeLogs.filter(l => (l.riskScore || 0) >= 70).length;

  const data = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Risk Level",
        data: [lowRisk, mediumRisk, highRisk],
        backgroundColor: [
          "rgba(34,197,94,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(239,68,68,0.8)"
        ],
        borderRadius: 10,
        barThickness: 45
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff"
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#374151",
          font: {
            size: 13,
            weight: "600"
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#e5e7eb"
        },
        ticks: {
          color: "#6b7280",
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="h-[320px]">
      {safeLogs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No data available
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}

      
    </div>
  );
}

export default RiskChart;