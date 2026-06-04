import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/api';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        // Assuming API returns array directly based on Phase 1 PRD, 
        // wait, Phase 1 returned array directly. Let's handle both array or {success, data}
        const data = response.data.data || response.data;
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError('تعذر تحميل الدورات. يرجى المحاولة لاحقاً.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container">
      <h1 className="page-title text-center mb-4">اكتشف دوراتنا</h1>
      {courses.length === 0 ? (
        <div className="glass-panel text-center">لا توجد دورات متاحة حالياً.</div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
