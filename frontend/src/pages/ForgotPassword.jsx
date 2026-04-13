const handleSendOtp = async () => {
  await axios.post("/api/auth/forgot-password", { email });
};

const handleReset = async () => {
  await axios.post("/api/auth/reset-password", {
    email,
    otp,
    newPassword
  });
};