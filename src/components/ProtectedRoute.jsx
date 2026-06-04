import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false, requireApproved = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-muted">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/grades" replace />;
  }

  if (!requireAdmin && requireApproved && user.role !== 'admin' && user.status !== 'approved') {
    return <Navigate to="/waiting-approval" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
