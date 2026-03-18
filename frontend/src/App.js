import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// AUTH PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";

// DASHBOARDS
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

// ADMIN PAGES
import Users from "./pages/Users";
import LoginLogs from "./pages/LoginLogs";
import Anomalies from "./pages/Anomalies";
import FraudDashboard from "./pages/FraudDashboard";

// NEW FRAUD ANALYTICS PAGE
import FraudDetection from "./pages/FraudDetection";

// ACCOUNT PAGES
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";

// ROUTE PROTECTION
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute role="admin">
              <LoginLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/anomalies"
          element={
            <ProtectedRoute role="admin">
              <Anomalies />
            </ProtectedRoute>
          }
        />

        {/* FRAUD MONITORING DASHBOARD */}
        <Route
          path="/admin/fraud"
          element={
            <ProtectedRoute role="admin">
              <FraudDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADVANCED FRAUD ANALYTICS */}
        <Route
          path="/admin/fraud-analytics"
          element={
            <ProtectedRoute role="admin">
              <FraudDetection />
            </ProtectedRoute>
          }
        />

        {/* ================= ACCOUNT ================= */}

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute role="admin">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/help"
          element={
            <ProtectedRoute role="admin">
              <HelpCenter />
            </ProtectedRoute>
          }
        />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;