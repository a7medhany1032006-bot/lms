import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, XCircle, Calendar, BookOpen } from 'lucide-react';
import api from '../../services/api';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return dateStr; }
};

const ExamHistory = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/dashboard/exams');
        setExams(res.data.data || []);
      } catch {
        setError('فشل تحميل سجل الاختبارات.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <div className="loading">جاري تحميل سجل الاختبارات...</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>سجل الاختبارات</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>جميع الاختبارات التي أديتها ونتائجها</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {exams.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ marginBottom: '0.5rem' }}>لم تؤدِ أي اختبار بعد</h3>
          <p style={{ color: 'var(--text-muted)' }}>ادخل لدوراتك وابدأ أداء الاختبارات</p>
          <Link to="/grades" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            استعرض المحتوى
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Summary Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div className="glass-panel" style={{ flex: 1, minWidth: 140, padding: '1rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{exams.length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>إجمالي الاختبارات</div>
            </div>
            <div className="glass-panel" style={{ flex: 1, minWidth: 140, padding: '1rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{exams.filter(e => e.passed).length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ناجح</div>
            </div>
            <div className="glass-panel" style={{ flex: 1, minWidth: 140, padding: '1rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>{exams.filter(e => !e.passed).length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>يحتاج مراجعة</div>
            </div>
          </div>

          {/* Exam Cards */}
          {exams.map(exam => {
            const scorePercent = exam.total_questions > 0
              ? Math.round((exam.score / exam.total_questions) * 100)
              : 0;
            return (
              <div key={exam.id} className="glass-panel" style={{
                borderRadius: '14px', padding: '1.5rem',
                borderColor: exam.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Status icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '10px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: exam.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
                  }}>
                    {exam.passed
                      ? <CheckCircle size={22} style={{ color: '#10b981' }} />
                      : <XCircle size={22} style={{ color: '#ef4444' }} />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{exam.exam_title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <BookOpen size={13} />
                      <span>{exam.course_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <Calendar size={13} />
                      {formatDate(exam.submitted_at)}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      fontSize: '1.6rem', fontWeight: 800, lineHeight: 1,
                      color: exam.gradingStatus === 'pending_review' ? '#eab308' : (exam.passed ? '#10b981' : '#ef4444')
                    }}>
                      {exam.gradingStatus === 'pending_review' ? '—' : `${exam.score}/${exam.total_questions}`}
                    </div>
                    {exam.gradingStatus !== 'pending_review' && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{scorePercent}%</div>
                    )}
                    <div style={{
                      marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 600,
                      padding: '0.2rem 0.7rem', borderRadius: '100px', display: 'inline-block',
                      background: exam.gradingStatus === 'pending_review' ? 'rgba(234,179,8,0.15)' : (exam.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)'),
                      color: exam.gradingStatus === 'pending_review' ? '#eab308' : (exam.passed ? '#10b981' : '#ef4444')
                    }}>
                      {exam.gradingStatus === 'pending_review' ? 'قيد المراجعة' : (exam.passed ? 'ناجح ✓' : 'يحتاج مراجعة')}
                    </div>
                  </div>
                </div>

                {/* Teacher Comments */}
                {exam.teacherComments && exam.teacherComments.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>ملاحظات المعلم:</div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {exam.teacherComments.map((comment, idx) => (
                        <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          {comment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
