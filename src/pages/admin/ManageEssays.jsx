import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, ChevronUp, ChevronDown, ExternalLink, PenTool, BookOpen } from 'lucide-react';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};

const SortIcon = ({ field, current, dir }) => {
  if (current !== field) return <span style={{ opacity: 0.25 }}>↕</span>;
  return dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

const ManageEssays = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('submitted_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/admin/essay-submissions');
        setSubmissions(res.data.data || []);
      } catch (err) {
        setError('فشل تحميل قائمة التقييم.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = submissions.filter(s => {
    const matchesSearch = s.student_name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.exam_title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'submitted_at') { va = new Date(va || 0); vb = new Date(vb || 0); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="loading" style={{ paddingTop: '4rem' }}>جاري التحميل...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>تقييم المقالات</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>مراجعة إجابات الطلاب للأسئلة المقالية وتقييمها</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="البحث باسم الطالب أو الاختبار..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingRight: '2.5rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input" 
            style={{ width: 'auto', padding: '0.6rem 1rem' }}
          >
            <option value="all">الكل</option>
            <option value="pending_review">قيد المراجعة</option>
            <option value="graded">مقيّم</option>
          </select>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {filtered.length} تسليم
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {[
                  { key: 'student_name', label: 'الطالب' },
                  { key: 'exam_title', label: 'الاختبار' },
                  { key: 'course_title', label: 'الدورة' },
                  { key: 'submitted_at', label: 'تاريخ التسليم' },
                  { key: 'status', label: 'الحالة' },
                  { key: null, label: 'الإجراء' },
                ].map(col => (
                  <th key={col.key || 'action'} onClick={col.key ? () => handleSort(col.key) : undefined}
                    style={{
                      textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.85rem',
                      color: sortField === col.key ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: col.key ? 'pointer' : 'default',
                      whiteSpace: 'nowrap'
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    لا توجد تسليمات مقالية
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {(s.student_name || 'ط').charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500, color: '#fff' }}>{s.student_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: '#fff', fontSize: '0.9rem' }}>{s.exam_title}</td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.course_title}</td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(s.submitted_at)}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                      background: s.status === 'graded' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
                      color: s.status === 'graded' ? '#10b981' : '#eab308'
                    }}>
                      {s.status === 'graded' ? <CheckCircle size={14} /> : <PenTool size={14} />}
                      {s.status === 'graded' ? 'مقيّم' : 'قيد المراجعة'}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <Link to={`/admin/essay-grading/${s.id}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
                      padding: '0.35rem 0.75rem', borderRadius: '6px',
                      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                      transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}>
                      {s.status === 'graded' ? 'تعديل التقييم' : 'تقييم الآن'} <ExternalLink size={13} />
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

export default ManageEssays;
