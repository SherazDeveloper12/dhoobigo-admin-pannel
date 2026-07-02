import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';

const AdminDataContext = createContext();

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within an AdminDataProvider');
  return context;
};

export const AdminDataProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loading, setLoading] = useState({ stats: true, users: true, verification: true });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (force = false) => {
    if (stats && !force) return;
    try {
      const response = await adminService.getStats();
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [stats]);

  const refreshAll = useCallback(async () => {
    setLoading({ stats: true, users: true, verification: true });
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      
      setStats(statsRes.data);
      
      const normalized = usersRes.data.map(u => ({
        ...u,
        id: u.userId || u.id || u.Id,
        userId: u.userId || u.id || u.Id,
        isVerified: !!(u.isVerified || u.IsVerified),
        isUpgradePending: !!(u.isUpgradePending || u.IsUpgradePending),
        fullName: u.fullName || u.FullName,
        role: u.role || u.Role,
        email: u.email || u.Email
      }));
      
      setUsers(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Aggressive refresh failed:', error);
    } finally {
      setLoading({ stats: false, users: false, verification: false });
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value = {
    stats,
    users,
    unverifiedUsers: (users || []).filter(u => ((u.role === 'Dhobi' || u.role === 'Rider') && !u.isVerified) || u.isUpgradePending),
    pendingCount: (users || []).filter(u => ((u.role === 'Dhobi' || u.role === 'Rider') && !u.isVerified) || u.isUpgradePending).length,
    loading,
    lastUpdated,
    fetchStats: refreshAll,
    fetchUsers: refreshAll,
    fetchUnverified: refreshAll,
    refreshAll,
    setUsers
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
