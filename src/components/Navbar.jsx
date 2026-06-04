import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar glass-panel">
      <div className="container flex items-center justify-between">
        <Link to="/" className="brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">هاني دويدار - عربي بالأرقام</span>
        </Link>
        <nav>
          <ul className="nav-links flex items-center">
            <li><Link to="/">الرئيسية</Link></li>
            <li><Link to="/grades">الصفوف</Link></li>
            <li><Link to="/courses">الدورات</Link></li>
            {user ? (
              <li style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '8px', textDecoration: 'none' }}
                >
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1 }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role === 'admin' ? 'مدير النظام' : 'طالب'}</div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <LogOut size={16} /> خروج
                </button>
              </li>
            ) : (
              <li style={{ marginRight: '1rem' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}>تسجيل الدخول</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
