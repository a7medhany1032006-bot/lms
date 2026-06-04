import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, User, ArrowRight, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout flex">
      <div className="mobile-header">
        <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)', margin: 0 }}>لوحة الطالب</h2>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      <aside className={`admin-sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`} style={{ borderLeft: '1px solid var(--border-color)' }}>
        {/* Branding */}
        <div className="sidebar-brand text-center" style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <button className="mobile-menu-btn" onClick={closeMenu} style={{ position: 'absolute', left: 0, top: 0, display: 'none' }} >
            <X size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
          </div>
          <h2 style={{
            color: 'var(--secondary)',
            fontSize: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '0.5rem',
            lineHeight: 1.5
          }}>
            لوحة الطالب
          </h2>
          {user && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              مرحباً، {user.full_name}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMenu}>
            <LayoutDashboard size={20} /><span>نظرة عامة</span>
          </Link>
          <Link to="/dashboard/courses" className={`sidebar-link ${isActive('/dashboard/courses') ? 'active' : ''}`} onClick={closeMenu}>
            <BookOpen size={20} /><span>دوراتي</span>
          </Link>
          <Link to="/dashboard/exams" className={`sidebar-link ${isActive('/dashboard/exams') ? 'active' : ''}`} onClick={closeMenu}>
            <ClipboardList size={20} /><span>سجل الاختبارات</span>
          </Link>
          <Link to="/dashboard/profile" className={`sidebar-link ${isActive('/dashboard/profile') ? 'active' : ''}`} onClick={closeMenu}>
            <User size={20} /><span>ملفي الشخصي</span>
          </Link>

          <div style={{ borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

          <Link to="/grades" className="sidebar-link" onClick={closeMenu}>
            <ArrowRight size={20} /><span>العودة للمحتوى</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-link" style={{
            background: 'none',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            color: '#ef4444',
            textAlign: 'right',
            fontFamily: 'inherit',
            fontSize: '1rem'
          }}>
            <LogOut size={20} /><span>تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
