import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import DhobiVerification from './pages/admin/DhobiVerification';
import ManageUsers from './pages/admin/ManageUsers';
import OrderMonitor from './pages/admin/OrderMonitor';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import SupportChat from './pages/admin/SupportChat';

import ProtectedRoute from './components/ProtectedRoute';
import { AdminDataProvider } from './context/AdminDataContext';
import { ToastProvider } from './context/ToastContext';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="admin-layout">
      <div className="bg-pattern"></div>
      <Sidebar />
      <main className="main-content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute><AdminDataProvider><MainLayout /></AdminDataProvider></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verification" element={<DhobiVerification />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/orders" element={<OrderMonitor />} />
            <Route path="/chat" element={<SupportChat />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
