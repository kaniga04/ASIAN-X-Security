import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate(data.user.role === "admin" ? "/admin" : "/user");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 relative px-4">

      {/* Glow Background */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-40"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >

        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-9 h-9 text-indigo-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Asian‑X Security
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              AI‑Powered Login Anomaly Detection
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                Email Address
              </label>

              <input
                type="email"
                placeholder="admin@asianx.sec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            >
              {loading ? "Signing In..." : "Sign In to Dashboard"}
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Asian‑X Security • Cyber Threat Monitoring Platform
        </p>

      </motion.div>
    </div>
  );
};

export default Login;