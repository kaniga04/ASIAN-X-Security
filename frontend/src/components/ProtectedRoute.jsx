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

  let user = null;

  try {
    user = JSON.parse(storedUser);
  } catch (err) {
    console.error("Invalid user data");
    return <Navigate to="/" replace />;
  }

  // Role check
  if (role && (!user?.role || user.role !== role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;