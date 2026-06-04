import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExams, getCourseById } from '../../services/api';
import { ClipboardList, Clock, Home, BookOpen } from 'lucide-react';

const ExamPage = () => {
  const { courseId } = useParams();
  const [exams, setExams] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, courseRes] = await Promise.all([
          getExams(courseId),
          getCourseById(courseId),
        ]);
        const eData = examsRes.data.data || examsRes.data;
        setExams(Array.isArray(eData) ? eData : []);
        setCourse(courseRes.data.data || courseRes.data);
      } catch {
        setError('تعذر تحميل بيانات الاختبار.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container lms-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4">
        <Link to="/grades" className="breadcrumb-item"><Home size={14} /> الرئيسية</Link>
        <span className="breadcrumb-sep">›</span>
        {course?.grade_id && (
          <>
            <Link to={`/grades/${course.grade_id}/courses`} className="breadcrumb-item">الصف</Link>
            <span className="breadcrumb-sep">›</span>
          </>
        )}
        <Link to={`/courses/${courseId}/lessons`} className="breadcrumb-item">{course?.title}</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item active">الاختبارات</span>
      </nav>

      <div className="lms-page-header">
        <div className="flex items-center" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(139,92,246,0.2)', borderRadius: '12px', color: 'var(--secondary)' }}>
            <ClipboardList size={28} />
          </div>
          <h1 className="lms-title" style={{ marginBottom: 0 }}>اختبارات الدورة</h1>
        </div>
        <p className="lms-subtitle text-muted">
          اختبارات خاصة بدورة: <strong style={{ color: 'var(--text-main)' }}>{course?.title}</strong>
        </p>
      </div>

      {/* Back to lessons */}
      <Link to={`/courses/${courseId}/lessons`} className="btn btn-secondary mb-4"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <BookOpen size={16} /> العودة للدروس
      </Link>

      {exams.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>لا توجد اختبارات لهذه الدورة بعد.</p>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>ستظهر الاختبارات هنا عند إضافتها من لوحة الإدارة.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card glass-panel">
              <div className="exam-card-header">
                <div className="exam-icon">
                  <ClipboardList size={22} />
                </div>
                <div className="exam-card-info">
                  <h2 className="exam-title">{exam.title}</h2>
                  {exam.time_limit && (
                    <span className="exam-duration">
                      <Clock size={14} /> {exam.time_limit} دقيقة
                    </span>
                  )}
                </div>
              </div>
              {exam.description && (
                <p className="exam-desc text-muted">{exam.description}</p>
              )}
              <div className="exam-card-footer">
                <Link to={`/exams/${exam.id}`} className="btn">بدء الاختبار</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamPage;
