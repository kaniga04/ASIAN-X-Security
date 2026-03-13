import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(storedUser);

  // If role is required and doesn't match
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
