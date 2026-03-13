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

// REGISTER CHART ELEMENTS
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function RiskChart({ logs }) {

  const lowRisk = logs.filter(log => log.riskScore < 30).length;
  const mediumRisk = logs.filter(
    log => log.riskScore >= 30 && log.riskScore < 70
  ).length;
  const highRisk = logs.filter(log => log.riskScore >= 70).length;

  const data = {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [
      {
        label: "Risk Analysis",
        data: [lowRisk, mediumRisk, highRisk],

        backgroundColor: [
          "#22c55e",   // green
          "#f59e0b",   // orange
          "#ef4444"    // red
        ],

        borderRadius: 12,
        barThickness: 50
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
        backgroundColor: "#1f2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 8
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#374151",
          font: {
            size: 12,
            weight: "500"
          }
        }
      },

      y: {
        beginAtZero: true,
        grid: {
          color: "#e5e7eb"
        },
        ticks: {
          color: "#6b7280"
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Risk Distribution
        </h3>

        <span className="text-sm text-gray-500">
          Login Behavior Analysis
        </span>
      </div>

      <div className="h-[260px]">
        <Bar data={data} options={options} />
      </div>

    </div>
  );
}

export default RiskChart;