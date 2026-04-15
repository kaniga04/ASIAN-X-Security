import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      await axios.post(`/api/auth/reset-password/${token}`, {
        newPassword: password
      });

      alert("Password reset successful");
      navigate("/");
    } catch (err) {
      alert("Invalid or expired link");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="border p-2 w-full mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;