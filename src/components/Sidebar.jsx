import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, Users, ShoppingBag, LogOut, Shirt,
  ChevronRight, Bell, MessageSquare
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard',    icon: <LayoutDashboard size={18} />, path: '/' },
  { title: 'Verification', icon: <UserCheck size={18} />,       path: '/verification' },
  { title: 'Manage Users', icon: <Users size={18} />,           path: '/users' },
  { title: 'Order Monitor',icon: <ShoppingBag size={18} />,     path: '/orders' },
  { title: 'Support Chat', icon: <MessageSquare size={18} />,   path: '/chat' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <Shirt size={20} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-name">DhoobiGo</div>
          <div className="brand-tag">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label-text">{item.title}</span>
            <ChevronRight size={14} className="nav-chevron" />
          </NavLink>
        ))}

        <div className="nav-spacer" />
        <div className="nav-section-label">Account</div>
        <button className="nav-item logout-item" onClick={handleLogout}>
          <span className="nav-icon"><LogOut size={18} /></span>
          <span className="nav-label-text">Sign Out</span>
        </button>
      </nav>

      {/* Admin Profile */}
      <div className="sidebar-profile">
        <div className="profile-avatar">AD</div>
        <div className="profile-info">
          <div className="profile-name">Super Admin</div>
          <div className="profile-role">Verified Access</div>
        </div>
        <div className="profile-status" />
      </div>
    </aside>
  );
};

export default Sidebar;
