import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">C</div>
            {!collapsed && <span className="logo-text">Mini CRM</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/leads" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            {!collapsed && <span>Leads</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span>🚪</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
