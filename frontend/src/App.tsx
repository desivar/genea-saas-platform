import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages (we'll build these one by one)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TreeEditorPage from './pages/TreeEditorPage';
import PresentationPage from './pages/PresentationPage';
import PrintExportPage from './pages/PrintExportPage';
import SharePage from './pages/SharePage';
import AboutPage from './pages/AboutPage';

// Auth guard
import ProtectedRoute from './components/ProtectedRoute';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/share/:treeId" element={<SharePage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editor/:treeId" element={<TreeEditorPage />} />
        <Route path="/presentation/:treeId" element={<PresentationPage />} />
        <Route path="/print/:treeId" element={<PrintExportPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}