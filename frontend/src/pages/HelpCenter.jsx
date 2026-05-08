import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { HelpCircle, Book, MessageSquare, ChevronDown, ChevronUp, Search, Play, FileText, Mail, Phone, Clock, Shield, AlertTriangle, Globe, Star, Send, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";

/* ================= FAQ DATA ================= */
const faqs = [
  {
    q: "What is Login Anomaly Detection?",
    a: "Our system monitors login activities in real-time using AI-powered behavioral analysis. It detects suspicious patterns such as brute-force attacks, credential stuffing, unusual locations, impossible travel, and abnormal typing behavior using keystroke dynamics.",
    category: "General"
  },
  {
    q: "How does Behavioral DNA work?",
    a: "Behavioral DNA creates a unique typing profile by analyzing your keystroke dynamics - dwell time (how long keys are held), flight time (time between keys), and typing rhythm. Our custom neural network learns your pattern from 5+ logins and detects when someone else tries to use your credentials.",
    category: "Security"
  },
  {
    q: "What attacks can the system detect?",
    a: "Our multi-layer detection identifies: Superhuman Speed Bots, Paste/Autofill Attacks, Brute Force Tools, Credential Stuffing, Password Spraying, Session Hijacking, VPN/Proxy usage, Headless Browsers, and Impossible Travel between locations.",
    category: "Security"
  },
  {
    q: "How does Risk Scoring work?",
    a: "Risk score (0-100) is calculated using 6 factors: Device Risk (new device, VM, Tor), Location Risk (country change, impossible travel), Behavioral Risk (keystroke anomaly), DNA Risk (neural network mismatch), Temporal Risk (unusual time), and Velocity Risk (rapid logins).",
    category: "General"
  },
  {
    q: "What happens when High Risk is detected?",
    a: "For High/Critical risk (score 60+), the system auto-creates a security case, sends email alerts, and may redirect to a honeypot page that tracks attacker behavior. Critical risk (80+) can block the login entirely.",
    category: "Security"
  },
  {
    q: "How do I train the behavioral model?",
    a: "Simply login 5+ times with your natural typing speed. The system automatically learns your pattern. You can check training status in Profile > Behavioral Model Status. For bulk training, use our dataset importer script.",
    category: "General"
  },
  {
    q: "What are MITRE ATT&CK mappings?",
    a: "MITRE ATT&CK is a global cybersecurity framework. Our system maps detected threats to specific MITRE techniques (e.g., T1110 for Brute Force, T1078 for Valid Accounts, T1078.003 for Behavioral DNA Mismatch).",
    category: "Technical"
  },
  {
    q: "How do I block a suspicious user?",
    a: "Navigate to User Management, locate the user, and use the block option. For automated blocking, enable 'Login Attempt Lockout' in Settings > Security Preferences.",
    category: "General"
  },
  {
    q: "How does the Honeypot system work?",
    a: "When a high-risk login is detected, the attacker may be redirected to a fake admin panel showing fabricated sensitive data. If they interact with it (download, export), the system confirms malicious intent and creates a Critical case.",
    category: "Security"
  },
  {
    q: "Can I import external datasets?",
    a: "Yes! Use our Dataset Trainer: `node scripts/datasetTrainer.js train` to train models from JSON/CSV keystroke datasets. This creates multiple user profiles with unique typing characteristics for testing.",
    category: "Technical"
  }
];

/* ================= VIDEO GUIDES ================= */
const videoGuides = [
  { title: "Getting Started", duration: "3:45", icon: Play },
  { title: "Understanding Risk Scores", duration: "5:20", icon: Play },
  { title: "Managing Security Cases", duration: "4:15", icon: Play },
  { title: "Training Behavioral Models", duration: "6:30", icon: Play },
  { title: "Attack Detection Demo", duration: "8:00", icon: Play },
  { title: "Honeypot Configuration", duration: "4:50", icon: Play }
];

/* ================= DOCUMENTATION ================= */
const documents = [
  { title: "Incident Response Guide", icon: Shield, color: "text-red-500" },
  { title: "Threat Classification Matrix", icon: AlertTriangle, color: "text-orange-500" },
  { title: "MITRE ATT&CK Reference", icon: Globe, color: "text-blue-500" },
  { title: "API Documentation", icon: FileText, color: "text-purple-500" },
  { title: "Admin Manual", icon: Book, color: "text-indigo-500" },
  { title: "Security Best Practices", icon: Shield, color: "text-green-500" }
];

function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [contactForm, setContactForm] = useState({ subject: "", message: "", email: "" });
  const [formSent, setFormSent] = useState(false);
  const [helpfulFaqs, setHelpfulFaqs] = useState({});

  const categories = ["All", "General", "Security", "Technical"];

  /* ================= FILTER FAQS ================= */
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  /* ================= HANDLE CONTACT FORM ================= */
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setContactForm({ subject: "", message: "", email: "" });
    }, 3000);
  };

  /* ================= HANDLE FEEDBACK ================= */
  const handleFeedback = (index, helpful) => {
    setHelpfulFaqs(prev => ({ ...prev, [index]: helpful }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 space-y-6">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Help Center</h1>
            </div>
            <p className="text-indigo-100 text-lg mb-6">
              Find answers, learn about security features, and get support
            </p>
            
            {/* SEARCH BAR */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Book, label: "Articles", value: "10+", color: "bg-blue-100 text-blue-600" },
              { icon: Play, label: "Video Guides", value: "6", color: "bg-purple-100 text-purple-600" },
              { icon: MessageSquare, label: "FAQs", value: faqs.length.toString(), color: "bg-green-100 text-green-600" },
              { icon: Clock, label: "Response Time", value: "< 2hrs", color: "bg-orange-100 text-orange-600" }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SECTION - FAQ + GUIDES */}
            <div className="lg:col-span-2 space-y-6">

              {/* CATEGORY FILTERS */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ SECTION */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Frequently Asked Questions</h3>
                    <p className="text-xs text-gray-500">
                      {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>

                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No FAQs found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFaqs.map((faq, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              faq.category === "Security" ? "bg-red-100 text-red-600" :
                              faq.category === "Technical" ? "bg-purple-100 text-purple-600" :
                              "bg-blue-100 text-blue-600"
                            }`}>
                              {faq.category}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                          </div>
                          {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>

                        {openFaq === i && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              <span className="text-xs text-gray-400">Was this helpful?</span>
                              <button
                                onClick={() => handleFeedback(i, true)}
                                className={`p-1 rounded ${helpfulFaqs[i] === true ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(i, false)}
                                className={`p-1 rounded ${helpfulFaqs[i] === false ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEO GUIDES */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Play className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Video Guides</h3>
                    <p className="text-xs text-gray-500">Learn by watching step-by-step tutorials</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {videoGuides.map((video, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition text-left group"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                        <Play className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{video.title}</p>
                        <p className="text-xs text-gray-500">{video.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SYSTEM GUIDE */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Book className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">System Usage Guide</h3>
                    <p className="text-xs text-gray-500">Quick start walkthrough</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { step: "1", title: "Dashboard Overview", desc: "Monitor real-time security statistics, login activities, and risk analytics from the main dashboard." },
                    { step: "2", title: "Monitor Login Logs", desc: "Track authentication attempts with behavioral anomaly scores, travel analysis, and threat explanations." },
                    { step: "3", title: "Investigate Anomalies", desc: "Review AI-detected suspicious events with detailed forensic analysis and MITRE ATT&CK mappings." },
                    { step: "4", title: "Manage Cases", desc: "Security cases are auto-created for high-risk events. Review, investigate, and resolve them." },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-6">

              {/* CONTACT SUPPORT */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Contact Support</h3>
                    <p className="text-xs text-gray-500">We typically respond within 2 hours</p>
                  </div>
                </div>

                {formSent ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-gray-800">Message Sent!</p>
                    <p className="text-sm text-gray-500">We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Your Email</label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">Subject</label>
                      <input
                        type="text"
                        placeholder="Brief description of your issue"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">Message</label>
                      <textarea
                        rows="4"
                        placeholder="Describe your issue in detail..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* CONTACT INFO */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    support@asianx-security.com
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-indigo-500" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Mon-Fri, 9AM-6PM EST
                  </div>
                </div>
              </div>

              {/* DOCUMENTATION */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Documentation</h3>
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <doc.icon className={`w-4 h-4 ${doc.color}`} />
                      <span className="text-sm text-gray-700">{doc.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RATING */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
                <Star className="w-8 h-8 mx-auto mb-2 fill-current" />
                <p className="font-semibold">Rate Our Support</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 cursor-pointer hover:fill-current" />
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