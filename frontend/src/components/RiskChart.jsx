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

  // ✅ Safe fallback
  const safeLogs = logs || [];

  const lowRisk = safeLogs.filter(l => l.riskScore < 30).length;
  const mediumRisk = safeLogs.filter(
    l => l.riskScore >= 30 && l.riskScore < 70
  ).length;
  const highRisk = safeLogs.filter(l => l.riskScore >= 70).length;

  const data = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Risk Level",
        data: [lowRisk, mediumRisk, highRisk],

        backgroundColor: [
          "rgba(34,197,94,0.8)",   // green
          "rgba(245,158,11,0.8)",  // orange
          "rgba(239,68,68,0.8)"    // red
        ],

        borderRadius: 10,
        hoverBackgroundColor: [
          "#16a34a",
          "#d97706",
          "#dc2626"
        ],

        barThickness: 45
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 6,
        displayColors: false
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
    <div className="bg-white rounded-2xl shadow-md p-6 transition hover:shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Risk Distribution
          </h3>
          <p className="text-xs text-gray-500">
            Login behavior classification
          </p>
        </div>

        <div className="text-xs text-gray-400">
          Total: {safeLogs.length}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        {safeLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          Low
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          Medium
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          High
        </span>
      </div>

    </div>
  );
}

export default RiskChart;