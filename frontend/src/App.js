import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import Users from "./pages/Users";
import LoginLogs from "./pages/LoginLogs";
import Anomalies from "./pages/Anomalies";
import FraudDashboard from "./pages/FraudDashboard";


// NEW PAGES
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";

function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PAGES */}
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

        {/* EXISTING FRAUD DASHBOARD */}
        <Route
          path="/admin/fraud"
          element={
            <ProtectedRoute role="admin">
              <FraudDashboard />
            </ProtectedRoute>
          }
        />

        
        {/* ACCOUNT PAGES */}
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

        {/* USER DASHBOARD */}
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