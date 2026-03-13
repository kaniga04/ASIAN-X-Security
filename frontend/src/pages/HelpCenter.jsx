import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  HelpCircle,
  Book,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";

/* ---------------- FAQ DATA ---------------- */

const faqs = [
  {
    q: "What is Login Anomaly Detection?",
    a: "The system monitors login activities in real time and detects suspicious patterns such as brute‑force attacks, unusual locations, and abnormal login behaviour."
  },
  {
    q: "How does Risk Scoring work?",
    a: "Risk score is calculated using factors like failed logins, unusual IP addresses, new devices, location anomalies and login time patterns."
  },
  {
    q: "What is the ML Score?",
    a: "ML Score represents the machine learning model's confidence that a login event is suspicious or malicious."
  },
  {
    q: "What are MITRE ATT&CK mappings?",
    a: "MITRE ATT&CK is a global cybersecurity framework that categorizes attacker tactics and techniques used in cyber threats."
  },
  {
    q: "How can I block a suspicious user?",
    a: "Navigate to User Management, locate the user account and use the block option to disable their login access."
  }
];

/* ---------------- COMPONENT ---------------- */

function HelpCenter() {

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}

      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}

        <Topbar />

        <main className="p-6 space-y-6">

          {/* HEADER */}

          <div>
            <h1 className="text-2xl font-bold">Help Center</h1>
            <p className="text-gray-500 text-sm">
              Documentation, FAQs and technical support
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SECTION */}

            <div className="lg:col-span-2 space-y-6">

              {/* FAQ */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle size={20} className="text-blue-600" />
                  <h3 className="font-semibold">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="space-y-2">

                  {faqs.map((faq, i) => (

                    <div key={i} className="border rounded-md">

                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === i ? null : i)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                      >

                        <span className="text-sm font-medium">
                          {faq.q}
                        </span>

                        {openFaq === i
                          ? <ChevronUp size={18} />
                          : <ChevronDown size={18} />}

                      </button>

                      {openFaq === i && (

                        <div className="px-4 pb-4 text-sm text-gray-600">
                          {faq.a}
                        </div>

                      )}

                    </div>

                  ))}

                </div>

              </div>

              {/* SYSTEM GUIDE */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center gap-2 mb-4">
                  <Book size={20} className="text-blue-600" />
                  <h3 className="font-semibold">
                    System Usage Guide
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-gray-600">

                  <div>
                    <h4 className="font-medium text-gray-800">
                      1. Dashboard Overview
                    </h4>

                    <p>
                      The dashboard displays real‑time security statistics,
                      login activities, anomaly alerts and risk analytics.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">
                      2. Monitoring Login Logs
                    </h4>

                    <p>
                      The login logs page shows authentication attempts,
                      IP addresses, login time and login status.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">
                      3. Investigating Anomalies
                    </h4>

                    <p>
                      The anomaly detection page lists suspicious login
                      events detected by the AI model.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">
                      4. Fraud Analytics
                    </h4>

                    <p>
                      Fraud analytics provides login trend analysis,
                      anomaly heatmaps and risk distribution charts.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT SECTION */}

            <div className="space-y-6">

              {/* CONTACT SUPPORT */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={20} className="text-blue-600" />
                  <h3 className="font-semibold">
                    Contact Support
                  </h3>
                </div>

                <form className="space-y-4">

                  <div>

                    <label className="text-xs text-gray-500">
                      Subject
                    </label>

                    <input
                      type="text"
                      placeholder="Brief description"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500">
                      Message
                    </label>

                    <textarea
                      rows="5"
                      placeholder="Describe your issue"
                      className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                    />

                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Send Message
                  </button>

                </form>

              </div>

              {/* DOCUMENTATION */}

              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="font-semibold mb-3">
                  Security Documentation
                </h3>

                <div className="space-y-2">

                  {[
                    "Incident Response Guide",
                    "Threat Classification",
                    "MITRE ATT&CK Reference",
                    "API Documentation",
                    "Admin Manual"
                  ].map((doc) => (

                    <button
                      key={doc}
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >

                      <Book size={16} />
                      {doc}

                    </button>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default HelpCenter;