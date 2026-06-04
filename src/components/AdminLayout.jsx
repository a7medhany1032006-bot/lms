import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, LogOut, GraduationCap, ClipboardList, Users, UserCheck, PenTool, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="admin-layout flex">
      <div className="mobile-header">
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>لوحة الإدارة</h2>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      <aside className={`admin-sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand text-center" style={{ position: 'relative' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            لوحة الإدارة
          </h2>
          <button className="mobile-menu-btn" onClick={closeMenu} style={{ position: 'absolute', left: 0, top: 0, display: 'none' }} >
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={`sidebar-link ${isActive('/admin')}`} onClick={closeMenu}>
            <LayoutDashboard size={20} /><span>نظرة عامة</span>
          </Link>
          <Link to="/admin/courses" className={`sidebar-link ${isActive('/admin/courses')}`} onClick={closeMenu}>
            <BookOpen size={20} /><span>إدارة الدورات</span>
          </Link>
          <Link to="/admin/lessons" className={`sidebar-link ${isActive('/admin/lessons')}`} onClick={closeMenu}>
            <Video size={20} /><span>إدارة الدروس</span>
          </Link>
          <Link to="/admin/students" className={`sidebar-link ${location.pathname === '/admin/students' || location.pathname.startsWith('/admin/students/') && !location.pathname.includes('/pending') ? 'active' : ''}`} onClick={closeMenu}>
            <Users size={20} /><span>إدارة الطلاب</span>
          </Link>
          <Link to="/admin/students/pending" className={`sidebar-link ${location.pathname === '/admin/students/pending' ? 'active' : ''}`} onClick={closeMenu}>
            <UserCheck size={20} /><span>طلبات التسجيل</span>
          </Link>
          <Link to="/admin/exams" className={`sidebar-link ${isActive('/admin/exams')}`} onClick={closeMenu}>
            <ClipboardList size={20} /><span>إدارة الاختبارات</span>
          </Link>
          <Link to="/admin/essay-grading" className={`sidebar-link ${location.pathname.startsWith('/admin/essay-grading') ? 'active' : ''}`} onClick={closeMenu}>
            <PenTool size={20} /><span>تقييم المقالات</span>
          </Link>
          <Link to="/admin/grades" className={`sidebar-link ${isActive('/admin/grades')}`} onClick={closeMenu}>
            <GraduationCap size={20} /><span>إدارة الصفوف</span>
          </Link>
          <div style={{ borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }}></div>
          <Link to="/grades" className="sidebar-link" onClick={closeMenu}>
            <LogOut size={20} /><span>العودة للموقع</span>
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
