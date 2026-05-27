import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'user' | 'genealogist' | 'admin';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf6ef' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌳</div>
          <p style={{ color: '#9c8573', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
            Loading your family tree...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  // Admin can access everything
  if (user.role === 'admin') return <Outlet />;

  // Genealogist can access genealogist + user routes
  if (requiredRole === 'genealogist' && user.role === 'user') {
    return <Navigate to="/builder" replace />;
  }

  // Admin-only routes
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/builder" replace />;
  }

  return <Outlet />;
}