import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PresentationBuilderPage from './pages/PresentationBuilderPage';
import PrintExportPage from './pages/PrintExportPage';
import SharePage from './pages/SharePage';
import AboutPage from './pages/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/builder" />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/builder" />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/share/:treeId" element={<SharePage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/builder/:presentationId?" element={<PresentationBuilderPage />} />
        <Route path="/print/:treeId" element={<PrintExportPage />} />
      </Route>

      {/* Default */}
       <Route path="/" element={!token ? <LandingPage /> : <Navigate to="/builder" />} />
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