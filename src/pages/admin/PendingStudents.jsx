import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};

const PendingStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/students/pending');
      setStudents(res.data.data || []);
    } catch (err) {
      setError('فشل تحميل قائمة الانتظار.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await api.put(`/admin/students/${id}/approve`);
        toast.success('تمت الموافقة بنجاح');
      } else {
        await api.put(`/admin/students/${id}/reject`);
        toast.success('تم الرفض بنجاح');
      }
      // Remove from list
      setStudents(s => s.filter(stu => stu.id !== id));
    } catch {
      toast.error('حدث خطأ أثناء تنفيذ الإجراء');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading" style={{ paddingTop: '4rem' }}>جاري التحميل...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>طلبات التسجيل المعلقة</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>مراجعة واعتماد حسابات الطلاب الجدد قبل دخولهم للمنصة</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem' }}>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={32} style={{ color: '#10b981', opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>لا توجد طلبات معلقة</h3>
            <p style={{ margin: 0 }}>جميع طلبات التسجيل تمت مراجعتها</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>الاسم</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>البريد الإلكتروني</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>تاريخ التسجيل</th>
                  <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(234,179,8,0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                          {(s.full_name || 'ط').charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500, color: '#fff' }}>{s.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{s.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} /> {formatDate(s.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleAction(s.id, 'approve')}
                          disabled={actionLoading === s.id}
                          className="btn"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem',
                            borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.85rem', fontWeight: 600
                          }}
                        >
                          <Check size={14} /> قبول
                        </button>
                        <button
                          onClick={() => handleAction(s.id, 'reject')}
                          disabled={actionLoading === s.id}
                          className="btn"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem',
                            borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem', fontWeight: 600
                          }}
                        >
                          <X size={14} /> رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingStudents;
