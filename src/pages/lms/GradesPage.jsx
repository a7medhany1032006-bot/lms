import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGrades } from '../../services/api';
import { BookOpen, ChevronLeft } from 'lucide-react';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGrades()
      .then(res => {
        const data = res.data.data || res.data;
        setGrades(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('تعذر تحميل الصفوف الدراسية. يرجى المحاولة لاحقاً.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container lms-page">
      <div className="lms-page-header">
        <h1 className="lms-title">الصفوف الدراسية</h1>
        <p className="lms-subtitle text-muted">اختر صفك الدراسي للبدء في التعلم</p>
      </div>

      {grades.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-muted">لا توجد صفوف دراسية متاحة حالياً.</p>
        </div>
      ) : (
        <div className="lms-grid">
          {grades.map((grade, idx) => (
            <Link to={`/grades/${grade.id}/courses`} key={grade.id} className="lms-card glass-panel">
              <div className="lms-card-icon" style={{ background: `hsl(${(idx * 60) % 360}, 70%, 25%)` }}>
                <span className="lms-card-number">{idx + 1}</span>
              </div>
              <div className="lms-card-body">
                <h2 className="lms-card-title">{grade.name}</h2>
                {grade.description && <p className="lms-card-desc text-muted">{grade.description}</p>}
              </div>
              <div className="lms-card-arrow">
                <ChevronLeft size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradesPage;
