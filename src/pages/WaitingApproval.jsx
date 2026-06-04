import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, LogOut, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WaitingApproval = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isRejected = user?.status === 'rejected';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-color)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: isRejected ? 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: isRejected ? 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass-panel" style={{
        maxWidth: 520,
        width: '100%',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        textAlign: 'center',
        borderColor: isRejected ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
        background: isRejected
          ? 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(30,41,59,0.8) 100%)'
          : 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(30,41,59,0.8) 100%)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem',
          background: isRejected ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
          border: `2px solid ${isRejected ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
          animation: isRejected ? 'none' : 'pulse 2.5s ease-in-out infinite'
        }}>
          {isRejected ? '🚫' : '⏳'}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.15); }
            50% { box-shadow: 0 0 0 16px rgba(59,130,246,0); }
          }
        `}</style>

        {/* Title */}
        <h1 style={{ fontSize: '1.7rem', marginBottom: '0.75rem', color: isRejected ? '#ef4444' : '#fff' }}>
          {isRejected ? 'تم رفض طلبك' : 'في انتظار موافقة الإدارة'}
        </h1>

        {/* User greeting */}
        {user?.full_name && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            مرحباً، <strong style={{ color: '#fff' }}>{user.full_name}</strong>
          </p>
        )}

        {/* Message */}
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
          {isRejected
            ? 'نأسف على إبلاغك بأن طلب الوصول إلى المنصة قد تم رفضه. يمكنك التواصل مع الإدارة لمزيد من المعلومات.'
            : 'تم إنشاء حسابك بنجاح. حسابك قيد المراجعة حالياً من قِبل الإدارة. سيتم منحك الوصول إلى المحتوى بعد الموافقة.'
          }
        </p>

        {/* Status Chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem', borderRadius: '100px', marginBottom: '2rem',
          background: isRejected ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
          border: `1px solid ${isRejected ? 'rgba(239,68,68,0.25)' : 'rgba(234,179,8,0.25)'}`,
          color: isRejected ? '#ef4444' : '#eab308',
          fontSize: '0.9rem', fontWeight: 600
        }}>
          <Clock size={15} />
          {isRejected ? 'مرفوض' : 'قيد الانتظار'}
        </div>

        {/* Info box for pending */}
        {!isRejected && (
          <div style={{
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'right'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              📌 في حال عدم تلقي أي رد خلال 24 ساعة، يرجى التواصل مع الإدارة مباشرة.
            </p>
          </div>
        )}

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <Mail size={14} />
            <span>للتواصل: <a href="mailto:admin@lms.com" style={{ color: 'var(--primary)' }}>admin@lms.com</a></span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.5rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'inherit'
            }}
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
          <Link
            to="/"
            className="btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.5rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>

      {/* Platform name */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
        منصة هاني دويدار - عربي بالأرقام
      </p>
    </div>
  );
};

export default WaitingApproval;
