import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const ProgressBar = ({ value }) => (
  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
    <div style={{
      height: '100%', borderRadius: '100px',
      background: value >= 100
        ? 'linear-gradient(90deg, #10b981, #059669)'
        : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
      width: `${Math.min(value, 100)}%`,
      transition: 'width 0.6s ease'
    }} />
  </div>
);

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/dashboard/courses');
        setCourses(res.data.data || []);
      } catch {
        setError('فشل تحميل الدورات.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="loading">جاري تحميل الدورات...</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>دوراتي</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>تتبع تقدمك في الدورات التي بدأتها</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {courses.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ marginBottom: '0.5rem' }}>لم تبدأ أي دورة بعد</h3>
          <p style={{ color: 'var(--text-muted)' }}>ابدأ بتصفح الدروس لتظهر هنا تلقائياً</p>
          <Link to="/grades" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> استعرض المحتوى
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {courses.map(course => (
            <div key={course.id} className="glass-panel" style={{
              borderRadius: '16px', padding: '1.75rem',
              transition: 'all 0.2s',
              border: course.progress === 100
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: course.progress === 100
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(59,130,246,0.1)',
                  flexShrink: 0
                }}>
                  {course.progress === 100
                    ? <CheckCircle size={26} style={{ color: '#10b981' }} />
                    : <BookOpen size={26} style={{ color: '#3B82F6' }} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{course.title}</h3>
                    {course.progress === 100 && (
                      <span style={{
                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 600
                      }}>مكتملة ✓</span>
                    )}
                  </div>
                  {course.description && (
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem', fontSize: '0.9rem' }}>{course.description}</p>
                  )}

                  {/* Progress bar */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <TrendingUp size={14} /> التقدم
                      </span>
                      <span style={{ fontWeight: 700, color: course.progress === 100 ? '#10b981' : 'var(--primary)' }}>
                        {course.completedLessons}/{course.totalLessons} دروس ({course.progress}%)
                      </span>
                    </div>
                    <ProgressBar value={course.progress} />
                  </div>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0 }}>
                  <Link
                    to={course.lastLessonId ? `/lessons/${course.lastLessonId}` : `/courses/${course.id}/lessons`}
                    className="btn btn-primary"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ArrowLeft size={16} />
                    {course.progress === 100 ? 'مراجعة' : 'تابع التعلم'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
