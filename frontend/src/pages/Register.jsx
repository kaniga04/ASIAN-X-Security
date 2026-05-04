import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const API = /*process.env.REACT_APP_API_URL || */"http://localhost:5000/api/auth";

  const registerUser = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMsg("");
    setIsSuccess(false);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setMsg("❌ All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMsg("❌ Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/register`, {
        name,
        email,
        password,
      });

      setIsSuccess(true);
      setMsg("✅ Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || "Error registering"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Asian‑X Security</p>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
            isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 text-white font-semibold rounded-xl transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;