import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, ClipboardList, Activity, ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="glass-panel" style={{
      display: 'flex', alignItems: 'center', gap: '1.25rem',
      padding: '1.5rem', borderRadius: '16px', cursor: 'pointer',
      transition: 'all 0.2s', borderColor: `rgba(${color},0.2)`,
      background: `linear-gradient(135deg, rgba(${color},0.05) 0%, rgba(30,41,59,0.8) 100%)`
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '12px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: `rgba(${color},0.15)`
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
      </div>
    </div>
  </Link>
);

const activityIcon = (type) => {
  if (type === 'completed') return <CheckCircle size={16} style={{ color: '#10b981' }} />;
  if (type === 'exam') return <ClipboardList size={16} style={{ color: '#8B5CF6' }} />;
  return <BookOpen size={16} style={{ color: '#3B82F6' }} />;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        setOverview(res.data.data);
      } catch (err) {
        setError('فشل تحميل البيانات. تحقق من الاتصال بالخادم.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return (
    <div className="loading" style={{ paddingTop: '6rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      جاري تحميل لوحة التحكم...
    </div>
  );

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        marginBottom: '2rem', padding: '2rem 2.5rem', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        borderColor: 'rgba(59,130,246,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
              مرحباً، {user?.full_name} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              استمر في رحلتك التعليمية — التعلم يوماً بيوم يصنع الفارق.
            </p>
          </div>
          <div style={{ fontSize: '3.5rem' }}>🎓</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          icon={<BookOpen size={24} style={{ color: '#3B82F6' }} />}
          label="دورات نشطة"
          value={overview?.activeCourses ?? 0}
          color="59,130,246"
          to="/dashboard/courses"
        />
        <StatCard
          icon={<CheckCircle size={24} style={{ color: '#10b981' }} />}
          label="دروس مكتملة"
          value={overview?.completedLessons ?? 0}
          color="16,185,129"
          to="/dashboard/courses"
        />
        <StatCard
          icon={<ClipboardList size={24} style={{ color: '#8B5CF6' }} />}
          label="اختبارات مقدّمة"
          value={overview?.examsTaken ?? 0}
          color="139,92,246"
          to="/dashboard/exams"
        />
      </div>

      {/* Latest Activity */}
      <div className="glass-panel" style={{ borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Activity size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>آخر النشاطات</h2>
        </div>

        {overview?.latestActivity?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {overview.latestActivity.map((activity, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)'
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  {activityIcon(activity.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', color: '#fff' }}>{activity.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <Clock size={13} />
                  {formatDate(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📖</div>
            <p>لا توجد نشاطات حتى الآن. ابدأ بتصفح الدروس!</p>
            <Link to="/grades" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> ابدأ التعلم
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
