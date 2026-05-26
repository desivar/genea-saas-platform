import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'user' | 'genealogist';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { token, user, isLoading } = useAuth();

  // Still restoring session — show nothing yet
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-spin">🌳</div>
          <p className="text-stone-400 text-sm font-light tracking-wide">
            Loading your family tree...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check — genealogist-only routes
  if (requiredRole === 'genealogist' && user.role !== 'genealogist') {
    return <Navigate to="/dashboard" replace />;
  }

  // All good — render the protected page
  return <Outlet />;
}