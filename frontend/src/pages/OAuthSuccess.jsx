import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // store token
      localStorage.setItem("token", token);

      // decode user role from token (optional improvement later)
      // for now redirect to admin/user default
      navigate("/admin"); // or "/user"
    } else {
      navigate("/");
    }
  }, [navigate]);

  return <p className="text-center mt-10">Logging you in...</p>;
};

export default OAuthSuccess;