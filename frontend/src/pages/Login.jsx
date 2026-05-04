import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  MapPin,
  Clock,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeystrokeCapture } from "../hooks/useKeystrokeCapture";

const Login = () => {
  const navigate = useNavigate();

  /* ================= KEYSTROKE CAPTURE HOOK ================= */
  const {
    startCapture,
    handleKeyDown,
    handleKeyUp,
    getKeystrokeData,
    clearKeystrokeData,
    isCapturing,
    keyCount,
    typingSpeed
  } = useKeystrokeCapture();

  /* ================= DEVICE ID ================= */
  const getDeviceId = () => {
    let storedId = localStorage.getItem("deviceId");

    if (!storedId || storedId === "undefined" || storedId === "null") {
      storedId = crypto.randomUUID();
      localStorage.setItem("deviceId", storedId);
      console.log("🆕 New Device ID:", storedId);
    } else {
      console.log("✅ Existing Device ID:", storedId);
    }

    return storedId;
  };

  const [deviceId] = useState(getDeviceId());
  
  // Device info state
  const [deviceInfo] = useState(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cores: navigator.hardwareConcurrency || 'Unknown'
  }));

  /* ================= API ================= */
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000";

  /* ================= STATE ================= */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [location] = useState(null);

  /* ================= HANDLE PASSWORD FOCUS ================= */
  const handlePasswordFocus = () => {
    startCapture();
    console.log("🎯 Keystroke capture started");
  };

  /* ================= LOGIN ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deviceId) {
      setError("Device not ready. Please try again.");
      return;
    }

    setError("");
    setWarning(null);
    setLoading(true);

    // 🆕 GET KEYSTROKE DATA BEFORE ASYNC OPERATIONS
    const keystrokeData = getKeystrokeData();
    console.log("⌨️ Keystroke data captured:", {
      events: keystrokeData.events?.length || 0,
      totalEvents: keystrokeData.totalEvents || 0
    });

    // 🆕 WARNING IF NO DATA
    if (!keystrokeData.events || keystrokeData.events.length === 0) {
      console.warn("⚠️ No keystroke data captured! Typing pattern will not be analyzed.");
    }

    try {
      console.log("📤 Sending Device ID:", deviceId);
      console.log("📤 Sending keystroke events:", keystrokeData.events?.length || 0);

      const payload = {
        email: email.toLowerCase(),
        password,
        deviceId,
        keystrokeData: keystrokeData.events || [],
        deviceInfo,
        location
      };

      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        payload
      );

      if (data.requiresMFA) {
        setRequiresMFA(true);
        setTempToken(data.tempToken);
        setRiskAssessment(data.riskAssessment);
        setWarning({
          type: 'mfa',
          message: data.message || 'Additional verification required',
          riskAssessment: data.riskAssessment
        });
        setLoading(false);
        return;
      }

      if (data.riskAssessment && data.riskAssessment.level !== 'Low') {
        setRiskAssessment(data.riskAssessment);
        setWarning({
          type: 'risk',
          message: `${data.riskAssessment.level} Risk Login Detected`,
          riskAssessment: data.riskAssessment
        });
      }

      if (!data.token) {
        setError("Login failed");
        return;
      }

      if (data.securityInsights) {
        sessionStorage.setItem('securityInsights', JSON.stringify(data.securityInsights));
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (data.sessionId) {
        sessionStorage.setItem('sessionId', data.sessionId);
      }

      // 🆕 Show training status if available
      if (data.trainingStatus) {
        console.log("📊 Training Status:", data.trainingStatus);
      }

      clearKeystrokeData();

      if (data.riskAssessment?.level === 'High' || data.riskAssessment?.level === 'Critical') {
        setTimeout(() => {
          navigate(data.user.role === "admin" ? "/admin" : "/user");
        }, 2000);
      } else {
        navigate(data.user.role === "admin" ? "/admin" : "/user");
      }

    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password";

      if (message.toLowerCase().includes("verify")) {
        setError("⚠️ Please verify your email before login");
      } else if (message.toLowerCase().includes("invalid")) {
        setError("❌ Incorrect email or password");
      } else if (message.toLowerCase().includes("blocked")) {
        setError("🚫 Login blocked due to suspicious activity");
        if (err.response?.data?.riskScore) {
          setRiskAssessment({
            level: 'Critical',
            score: err.response.data.riskScore,
            reason: err.response.data.reason
          });
        }
      } else if (message.toLowerCase().includes("locked")) {
        setError(`🔒 ${message}`);
      } else {
        setError(message);
      }

      clearKeystrokeData();
    } finally {
      setLoading(false);
    }
  };

  /* ================= MFA VERIFICATION ================= */
  const handleMFAVerify = async () => {
    if (!mfaCode || mfaCode.length < 6) {
      setError("Please enter a valid verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/verify-mfa`,
        {
          tempToken,
          verificationCode: mfaCode
        }
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        clearKeystrokeData();
        navigate(data.user.role === "admin" ? "/admin" : "/user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GET RISK COLOR ================= */
  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 px-4 py-8">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Asian‑X Security
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              AI‑Powered Behavioral Authentication
            </p>
          </div>

          {/* KEYSTROKE CAPTURE INDICATOR */}
          {isCapturing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-xs text-indigo-700 font-medium">
                  Analyzing typing pattern
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-indigo-600">
                  {keyCount} keys
                </span>
                {typingSpeed > 0 && (
                  <span className="text-xs text-indigo-600">
                    {typingSpeed} keys/s
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* MFA REQUIRED VIEW */}
          {requiresMFA ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Verify Your Identity
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  We've detected unusual activity. Please enter the verification code sent to your email.
                </p>
              </div>

              {riskAssessment && (
                <div className={`p-3 rounded-xl border ${getRiskColor(riskAssessment.level)}`}>
                  <p className="text-sm font-medium">
                    Risk Score: {riskAssessment.score}/100
                  </p>
                  {riskAssessment.reasons?.map((reason, idx) => (
                    <p key={idx} className="text-xs mt-1 opacity-75">• {reason}</p>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handleMFAVerify}
                disabled={loading}
                className={`w-full h-11 text-white font-semibold rounded-xl ${
                  loading
                    ? "bg-gray-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={() => {
                  setRequiresMFA(false);
                  setTempToken(null);
                  setMfaCode("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <>
              {/* RISK WARNING */}
              <AnimatePresence>
                {warning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className={`p-4 rounded-xl border ${getRiskColor(warning.riskAssessment?.level)}`}>
                      <div className="flex items-start space-x-3">
                        {warning.riskAssessment?.level === 'High' || warning.riskAssessment?.level === 'Critical' ? (
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{warning.message}</p>
                          {warning.riskAssessment && (
                            <>
                              <p className="text-xs mt-1 opacity-75">
                                Risk Score: {warning.riskAssessment.score}/100
                              </p>
                              <button
                                onClick={() => setShowRiskDetails(!showRiskDetails)}
                                className="text-xs font-medium mt-2 hover:underline"
                              >
                                {showRiskDetails ? 'Hide Details' : 'View Details'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded Risk Details */}
                      <AnimatePresence>
                        {showRiskDetails && warning.riskAssessment && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                          >
                            {warning.riskAssessment.components && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium">Risk Factors:</p>
                                {Object.entries(warning.riskAssessment.components).map(([key, value]) => (
                                  value.score > 0 && (
                                    <div key={key} className="flex items-center justify-between text-xs">
                                      <span className="capitalize">{key}:</span>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                          <div
                                            className={`h-1.5 rounded-full ${
                                              value.score < 30 ? 'bg-green-500' :
                                              value.score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${value.score}%` }}
                                          />
                                        </div>
                                        <span className="w-6">{value.score}</span>
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}

                            {warning.riskAssessment.reasons?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Detected Anomalies:</p>
                                <ul className="space-y-1">
                                  {warning.riskAssessment.reasons.map((reason, idx) => (
                                    <li key={idx} className="text-xs flex items-start">
                                      <span className="mr-2">•</span>
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {warning.riskAssessment.recommendations?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Recommendations:</p>
                                <ul className="space-y-1">
                                  {warning.riskAssessment.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-xs flex items-start">
                                      <span className="mr-2 text-green-500">✓</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ERROR */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start space-x-2"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="admin@asianx.sec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={handlePasswordFocus}
                      onClick={handlePasswordFocus}
                      onKeyDown={handleKeyDown}
                      onKeyUp={handleKeyUp}
                      required
                      className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center space-x-1">
                        <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className={`h-1 flex-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* FORGOT PASSWORD */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* SECURITY INSIGHTS */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>Location detected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Monitor className="w-3 h-3" />
                    <span>{deviceInfo?.platform || 'Unknown Device'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing In...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

              </form>

              {/* REGISTER */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </>
          )}

        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Asian‑X Security • AI-Powered Behavioral Authentication
        </p>

        {/* Security Badge */}
        <div className="flex justify-center mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Protected by Advanced Behavioral Analytics</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;