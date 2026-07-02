import React from 'react';
import {
  Users, ShoppingBag, CheckCircle, TrendingUp,
  Clock, AlertCircle, ArrowUpRight, MoreHorizontal
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, accent, bg }) => (
  <div className="stat-card">
    <div className="stat-card-top">
      <div className="stat-icon-wrap" style={{ background: bg }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <span className="stat-trend">
        <ArrowUpRight size={11} />+{trend}%
      </span>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{title}</div>
  </div>
);

import { useEffect } from 'react';
import { useAdminData } from '../../context/AdminDataContext';

const Dashboard = () => {
  const { stats: data, loading, fetchStats, pendingCount, stats: rawStats } = useAdminData();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading.stats) return <div className="page-loading">Loading Dashboard Statistics...</div>;

  const fulfillmentRate = (rawStats?.totalOrders && rawStats.totalOrders > 0)
    ? Math.round(((rawStats.totalOrders - (rawStats.activeOrders || 0)) / rawStats.totalOrders) * 100) 
    : 100;

  const stats = [
    { title: 'Total Users',     value: data?.totalUsers || 0, icon: <Users size={22} />,        trend: '12', accent: '#0EA5E9', bg: '#E0F2FE' },
    { title: 'Total Orders',    value: data?.totalOrders || 0, icon: <ShoppingBag size={22} />,  trend: '8',  accent: '#8B5CF6', bg: '#EDE9FE' },
    { title: 'Active Orders',   value: data?.activeOrders || 0, icon: <Clock size={22} />,       trend: '5',  accent: '#10B981', bg: '#D1FAE5' },
    { title: 'Total Bids',      value: data?.totalBids || 0,   icon: <TrendingUp size={22} />,   trend: '15', accent: '#F59E0B', bg: '#FEF3C7' },
  ];

  const recentOrders = data?.recentOrders || [];

  const statusStyle = {
    'PendingBidding': { bg: '#FEF3C7', color: '#D97706' },
    'BidSelected':    { bg: '#E0F2FE', color: '#0EA5E9' },
    'PickupScheduled':{ bg: '#EDE9FE', color: '#8B5CF6' },
    'InLaundry':      { bg: '#DBEAFE', color: '#2563EB' },
    'OutForDelivery': { bg: '#D1FAE5', color: '#10B981' },
    'Completed':      { bg: '#F1F5F9', color: '#64748B' },
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Management Overview</h1>
          <p className="page-subtitle">Track your laundry ecosystem metrics in real-time.</p>
        </div>
        <div className="header-actions">
          <div className="notif-btn">
            <AlertCircle size={18} />
            <span className="notif-dot" />
          </div>
          <div className="date-badge">
            <Clock size={14} />
            <span>{new Date().toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row animate-fade">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid animate-fade" style={{ animationDelay: '0.1s' }}>
        {/* Orders Table */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Recent Orders</h3>
              <p className="panel-sub">Latest transactions across the platform</p>
            </div>
            <button className="btn-primary" onClick={() => window.location.href = '/orders'}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Dhobi</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusStyle[order.status] || { bg: '#F1F5F9', color: '#64748B' };
                  return (
                    <tr key={order.id} className="data-row">
                      <td><span className="order-id">#ORD-{order.id}</span></td>
                      <td className="fw-bold">{order.customerName || 'Customer'}</td>
                      <td className="text-secondary">{order.serviceDescription}</td>
                      <td>
                        <span className="status-chip" style={{ background: s.bg, color: s.color }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="fw-bold primary-text">Rs. {order.totalAmount || 0}</td>
                      <td className="text-muted">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Notifications</h3>
              <p className="panel-sub">Requires your attention</p>
            </div>
            <button className="icon-btn"><MoreHorizontal size={18} /></button>
          </div>
          <div className="notif-list">
            <div className={`notif-item ${pendingCount > 0 ? 'warning' : 'info'}`}>
              <div className={`notif-icon ${pendingCount > 0 ? 'warn-icon' : 'info-icon'}`}><AlertCircle size={18} /></div>
              <div className="notif-body">
                <p className="notif-text">{pendingCount} Registration Requests</p>
                <span className="notif-time">{pendingCount > 0 ? 'Awaiting Review' : 'Up to date'}</span>
              </div>
              {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
            </div>
            <div className="notif-item info">
              <div className="notif-icon info-icon"><Clock size={18} /></div>
              <div className="notif-body">
                <p className="notif-text">Backend Sync Success</p>
                <span className="notif-time">Just now</span>
              </div>
            </div>
            <div className="notif-item success">
              <div className="notif-icon success-icon"><CheckCircle size={18} /></div>
              <div className="notif-body">
                <p className="notif-text">Platform is Healthy</p>
                <span className="notif-time">Live Status Active</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="quick-stat-item">
              <div className="qs-value" style={{ color: '#0EA5E9' }}>{fulfillmentRate}%</div>
              <div className="qs-label">Fulfillment</div>
            </div>
            <div className="qs-divider" />
            <div className="quick-stat-item">
              <div className="qs-value" style={{ color: '#10B981' }}>4.9★</div>
              <div className="qs-label">Avg Rating</div>
            </div>
            <div className="qs-divider" />
            <div className="quick-stat-item">
              <div className="qs-value" style={{ color: '#F59E0B' }}>12m</div>
              <div className="qs-label">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
