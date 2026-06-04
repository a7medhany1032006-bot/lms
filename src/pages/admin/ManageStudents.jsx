import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, CheckCircle, Search, ChevronUp, ChevronDown, ExternalLink, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-panel" style={{
    display: 'flex', alignItems: 'center', gap: '1.25rem',
    padding: '1.5rem', borderRadius: '16px',
    background: `linear-gradient(135deg, rgba(${color},0.06) 0%, rgba(30,41,59,0.7) 100%)`,
    borderColor: `rgba(${color},0.2)`
  }}>
    <div style={{ width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${color},0.15)`, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#fff' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  </div>
);

const SortIcon = ({ field, current, dir }) => {
  if (current !== field) return <span style={{ opacity: 0.25 }}>↕</span>;
  return dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, stuRes] = await Promise.all([
          api.get('/admin/students/overview'),
          api.get('/admin/students')
        ]);
        setOverview(ovRes.data.data);
        setStudents(stuRes.data.data || []);
      } catch (err) {
        setError('فشل تحميل بيانات الطلاب.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'avgScore') { va = a.avgScore ?? -1; vb = b.avgScore ?? -1; }
    if (sortField === 'lastActivity') { va = a.lastActivity ? new Date(a.lastActivity) : 0; vb = b.lastActivity ? new Date(b.lastActivity) : 0; }
    if (sortField === 'created_at') { va = new Date(va || 0); vb = new Date(vb || 0); }
    if (sortField === 'status') { va = va || ''; vb = vb || ''; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'approved') await api.put(`/admin/students/${id}/approve`);
      else if (newStatus === 'rejected') await api.put(`/admin/students/${id}/reject`);
      
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success('تم تحديث حالة الطالب');
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="loading" style={{ paddingTop: '4rem' }}>جاري تحميل بيانات الطلاب...</div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>إدارة الطلاب</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>استعراض ومتابعة جميع الطلاب المسجلين في المنصة</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={<Users size={22} style={{ color: '#3B82F6' }} />} label="إجمالي الطلاب" value={overview?.totalStudents} color="59,130,246" />
        <StatCard icon={<Activity size={22} style={{ color: '#10b981' }} />} label="طلاب نشطون" value={overview?.activeStudents} color="16,185,129" />
        <StatCard icon={<ClipboardList size={22} style={{ color: '#8B5CF6' }} />} label="محاولات الاختبارات" value={overview?.totalExamAttempts} color="139,92,246" />
        <StatCard icon={<CheckCircle size={22} style={{ color: '#06B6D4' }} />} label="دروس مكتملة" value={overview?.totalCompletedLessons} color="6,182,212" />
      </div>

      {/* Table Panel */}
      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-input"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingRight: '2.5rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {filtered.length} طالب
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {[
                  { key: 'full_name', label: 'الاسم الكامل' },
                  { key: 'email', label: 'البريد الإلكتروني' },
                  { key: 'created_at', label: 'تاريخ التسجيل' },
                  { key: 'status', label: 'الحالة' },
                  { key: 'activeCourses', label: 'الدورات' },
                  { key: 'examsTaken', label: 'الاختبارات' },
                  { key: 'avgScore', label: 'المتوسط' },
                  { key: 'lastActivity', label: 'آخر نشاط' },
                  { key: null, label: '' },
                ].map(col => (
                  <th key={col.key || 'action'} onClick={col.key ? () => handleSort(col.key) : undefined}
                    style={{
                      textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.85rem',
                      color: sortField === col.key ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none', whiteSpace: 'nowrap'
                    }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {col.label}
                      {col.key && <SortIcon field={col.key} current={sortField} dir={sortDir} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    لا يوجد طلاب مطابقون للبحث
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                >
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 700, color: '#fff'
                      }}>
                        {(s.full_name || 'ط').charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500, color: '#fff' }}>{s.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.email}</td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{formatDate(s.created_at)}</td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                    <select
                      value={s.status || 'approved'}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      style={{
                        padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                        background: s.status === 'pending' ? 'rgba(234,179,8,0.1)' : s.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: s.status === 'pending' ? '#eab308' : s.status === 'rejected' ? '#ef4444' : '#10b981',
                        border: 'none', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="approved">معتمد</option>
                      <option value="pending">معلق</option>
                      <option value="rejected">مرفوض</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                    <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.7rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {s.activeCourses}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#fff', fontWeight: 600 }}>{s.examsTaken}</td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                    {s.avgScore !== null
                      ? <span style={{ color: s.avgScore >= 50 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{s.avgScore}%</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(s.lastActivity)}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <Link to={`/admin/students/${s.id}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
                      padding: '0.3rem 0.7rem', borderRadius: '6px',
                      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                      transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}>
                      <ExternalLink size={13} /> عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn" style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: page === 1 ? 'var(--text-muted)' : '#fff', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              السابق
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="btn" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', minWidth: 36, fontWeight: p === page ? 700 : 400, background: p === page ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid ' + (p === page ? 'var(--primary)' : 'var(--border-color)'), fontSize: '0.9rem' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn" style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: page === totalPages ? 'var(--text-muted)' : '#fff', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
