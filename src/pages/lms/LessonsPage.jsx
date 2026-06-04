import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCourseById, getLessonsByCourseId } from '../../services/api';
import { PlayCircle, Home, ChevronLeft, ClipboardList } from 'lucide-react';

const LessonsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId),
        ]);
        const courseData = courseRes.data.data || courseRes.data;
        setCourse(courseData);
        const lessonsData = lessonsRes.data.data || lessonsRes.data;
        setLessons(Array.isArray(lessonsData) ? lessonsData : (courseData.lessons || []));
      } catch {
        setError('تعذر تحميل الدروس. يرجى المحاولة لاحقاً.');
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
        <span className="breadcrumb-item active">{course?.title}</span>
      </nav>

      <div className="lms-page-header">
        <h1 className="lms-title">{course?.title}</h1>
        {course?.description && <p className="lms-subtitle text-muted">{course.description}</p>}
        <div style={{ marginTop: '1.5rem' }}>
          <Link to={`/courses/${courseId}/exam`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} /> اختبارات الدورة
          </Link>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem' }}>
          <PlayCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-muted">لا توجد دروس لهذه الدورة بعد.</p>
        </div>
      ) : (
        <div className="lessons-lms-list">
          {lessons.map((lesson, idx) => (
            <Link to={`/lessons/${lesson.id}`} key={lesson.id} className="lessons-lms-item glass-panel">
              <div className="lesson-lms-num">{lesson.order_index || idx + 1}</div>
              <div className="lesson-lms-info">
                <h3 className="lesson-lms-title">{lesson.title}</h3>
              </div>
              <div className="lesson-lms-play">
                <PlayCircle size={28} style={{ color: 'var(--primary)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
