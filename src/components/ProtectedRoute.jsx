import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const isAuthenticated = !!token && user.role === 'Admin';

  if (!isAuthenticated) {
    // If not authenticated or not an admin, purge potentially invalid session and redirect
    if (!token || user.role !== 'Admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
