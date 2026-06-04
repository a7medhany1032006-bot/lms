import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGradeById, getCourses } from '../../services/api';
import { BookOpen, ChevronLeft, Home } from 'lucide-react';

const CoursesPage = () => {
  const { gradeId } = useParams();
  const [grade, setGrade] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradeRes, coursesRes] = await Promise.all([
          getGradeById(gradeId),
          getCourses(gradeId),
        ]);
        setGrade(gradeRes.data.data || gradeRes.data);
        const data = coursesRes.data.data || coursesRes.data;
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        setError('تعذر تحميل البيانات. يرجى المحاولة لاحقاً.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gradeId]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container lms-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4">
        <Link to="/grades" className="breadcrumb-item"><Home size={14} /> الرئيسية</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item active">{grade?.name}</span>
      </nav>

      <div className="lms-page-header">
        <h1 className="lms-title">{grade?.name}</h1>
        <p className="lms-subtitle text-muted">اختر الدورة التي تريد دراستها</p>
      </div>

      {courses.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-muted">لا توجد دورات لهذا الصف بعد.</p>
        </div>
      ) : (
        <div className="lms-grid">
          {courses.map((course, idx) => (
            <Link to={`/courses/${course.id}/lessons`} key={course.id} className="lms-card glass-panel">
              <div className="lms-card-icon" style={{ background: `hsl(${220 + idx * 30}, 70%, 25%)` }}>
                <BookOpen size={24} color="white" />
              </div>
              <div className="lms-card-body">
                <h2 className="lms-card-title">{course.title}</h2>
                {course.description && <p className="lms-card-desc text-muted">{course.description}</p>}
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

export default CoursesPage;
