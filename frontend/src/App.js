import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Anomalies from './pages/Anomalies';
import Cases from './pages/Cases';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import HelpCenter from './pages/HelpCenter';
import FraudDashboard from './pages/FraudDashboard';
import FraudDetection from './pages/FraudDetection';
import CSVAnalyzer from './pages/CSVAnalyzer';
import Campaigns from './pages/Campaigns';
import OAuthSuccess from './pages/OAuthSuccess';
import LoginLogs from './pages/LoginLogs';
import HoneyPotPage from './pages/HoneyPotPage';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><Users /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute allowedRole="admin"><LoginLogs /></ProtectedRoute>} />
        <Route path="/admin/anomalies" element={<ProtectedRoute allowedRole="admin"><Anomalies /></ProtectedRoute>} />
        <Route path="/admin/cases" element={<ProtectedRoute allowedRole="admin"><Cases /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><Profile /></ProtectedRoute>} />
        <Route path="/admin/fraud" element={<ProtectedRoute allowedRole="admin"><FraudDashboard /></ProtectedRoute>} />
        <Route path="/admin/csv-analyzer" element={<ProtectedRoute allowedRole="admin"><CSVAnalyzer /></ProtectedRoute>} />
        <Route path="/admin/campaigns" element={<ProtectedRoute allowedRole="admin"><Campaigns /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><Settings /></ProtectedRoute>} />
        
        {/* User Routes */}
        <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>} />
        <Route path="/user/fraud-detection" element={<ProtectedRoute allowedRole="user"><FraudDetection /></ProtectedRoute>} />
        
        {/* Shared */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<HelpCenter />} />

        {/*Honeypot*/}
        <Route path="/honeypot" element={<HoneyPotPage />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-center"><h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1><p className="text-gray-600 mb-6 text-lg">Page not found</p><a href="/" className="text-indigo-600 hover:underline font-medium">Go to Login</a></div></div>} />
      </Routes>
    </Router>
  );
}

export default App;