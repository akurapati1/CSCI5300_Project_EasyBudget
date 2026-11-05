import React, { useContext, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import './CSS/Dashboard.css';

import Home from './Home';
import Income from './Pages/income';
import Budget from './Pages/Budget';
import SavingsGoal from './Pages/SavingsGoal';
import Chart from './Pages/Chart';

const navItems = [
  { path: '/dashboard/home', label: 'Home', icon: '🏠' },
  { path: '/dashboard/income', label: 'Income', icon: '💰' },
  { path: '/dashboard/budget', label: 'Budget', icon: '📊' },
  { path: '/dashboard/savingsgoal', label: 'Savings', icon: '🎯' },
  { path: '/dashboard/chart', label: 'Charts', icon: '📈' },
];

const pageTitles = {
  '/dashboard/home': 'Home',
  '/dashboard/income': 'Income & Expenses',
  '/dashboard/budget': 'Budget',
  '/dashboard/savingsgoal': 'Savings Goals',
  '/dashboard/chart': 'Charts',
};

const Dashboard = () => {
  const { user, logout, initializing } = useContext(AuthContext);
  const { dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (initializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Please <a href="/" style={{ marginLeft: 6 }}>sign in</a> to view your dashboard.
      </div>
    );
  }

  const handleLogout = () => {
    logout(dispatch);
    navigate('/');
  };

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="dashboard-layout">
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Easy<span>Budget</span></h2>
          <p>Personal Finance Tracker</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <span className="topbar-title">{currentTitle}</span>
          </div>
          <div className="topbar-user">
            <div className="user-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
            <span className="user-name">{user.username}</span>
          </div>
        </div>

        <div className="dashboard-content">
          <Routes>
            <Route path="home" element={<Home user={user} />} />
            <Route path="income" element={<Income />} />
            <Route path="budget" element={<Budget />} />
            <Route path="savingsgoal" element={<SavingsGoal />} />
            <Route path="chart" element={<Chart />} />
            <Route path="*" element={<Home user={user} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
