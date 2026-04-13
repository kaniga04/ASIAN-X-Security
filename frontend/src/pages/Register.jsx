import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "https://asian-x-security.onrender.com/api/auth";

  /* ================= REGISTER ================= */
  const registerUser = async () => {
    try {
      setLoading(true);
      setMsg("");

      // ✅ validation
      if (!name || !email || !password || !confirmPassword) {
        setMsg("All fields are required");
        return;
      }

      if (password !== confirmPassword) {
        setMsg("Passwords do not match");
        return;
      }

      // ✅ API call
      await axios.post(`${API}/register`, {
        name,
        email,
        password,
      });

      setMsg("🎉 Account created successfully!");

      // 👉 redirect to login
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setMsg(err.response?.data?.message || "Error registering");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-xl font-bold mb-4 text-center">
          Register
        </h2>

        {msg && <p className="text-sm text-center mb-3">{msg}</p>}

        {/* NAME */}
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-3 p-2 border"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-3 p-2 border"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={registerUser}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </div>
    </div>
  );
}

export default Register;