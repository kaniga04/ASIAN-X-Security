import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ================= AUTH PAGES =================
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";

// ================= DASHBOARDS =================
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";

// ================= ADMIN PAGES =================
import Users from "./pages/Users";
import LoginLogs from "./pages/LoginLogs";
import Anomalies from "./pages/Anomalies";
import Cases from "./pages/Cases";
import Campaigns from "./pages/Campaigns"; // ✅ FIXED (moved here)
import FraudDashboard from "./pages/FraudDashboard";
import FraudDetection from "./pages/FraudDetection";
import CSVAnalyzer from "./pages/CSVAnalyzer";
import UserInvestigation from "./pages/UserInvestigation";

// ================= ACCOUNT PAGES =================
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";

// ================= ROUTE PROTECTION =================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= ADMIN ================= */}

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

        {/* ✅ CASE MANAGEMENT FIXED */}
        <Route
          path="/admin/cases"
          element={
            <ProtectedRoute role="admin">
              <Cases />
            </ProtectedRoute>
          }
        />

        {/* ✅ CAMPAIGNS ADDED */}
        <Route
          path="/admin/campaigns"
          element={
            <ProtectedRoute role="admin">
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/fraud"
          element={
            <ProtectedRoute role="admin">
              <FraudDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/fraud-analytics"
          element={
            <ProtectedRoute role="admin">
              <FraudDetection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/csv-analyzer"
          element={
            <ProtectedRoute role="admin">
              <CSVAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/investigation"
          element={
            <ProtectedRoute role="admin">
              <UserInvestigation />
            </ProtectedRoute>
          }
        />

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

        {/* ================= USER ================= */}

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/activity"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile"
          element={
            <ProtectedRoute role="user">
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;