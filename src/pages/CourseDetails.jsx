import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../services/api';
import LessonItem from '../components/LessonItem';
import VideoPlayer from '../components/VideoPlayer';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await getCourseById(id);
        const data = response.data.data || response.data;
        setCourse(data);
        if (data.lessons && data.lessons.length > 0) {
          setActiveLesson(data.lessons[0]);
        }
        setLoading(false);
      } catch (err) {
        setError('تعذر تحميل تفاصيل الدورة.');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!course) return <div className="container"><div className="error-message">الدورة غير موجودة.</div></div>;

  return (
    <div className="container course-details-page">
      <div className="course-header glass-panel mb-4">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>

      <div className="course-content-grid">
        <div className="video-section">
          <VideoPlayer videoUrl={activeLesson?.video_url} />
          {activeLesson && (
            <div className="current-lesson-info glass-panel mt-4">
              <h3>{activeLesson.title}</h3>
            </div>
          )}
        </div>
        
        <div className="lessons-sidebar glass-panel">
          <h3>محتوى الدورة</h3>
          <div className="lessons-list">
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map(lesson => (
                <LessonItem 
                  key={lesson.id} 
                  lesson={lesson} 
                  isActive={activeLesson?.id === lesson.id}
                  onClick={setActiveLesson}
                />
              ))
            ) : (
              <p className="text-muted">لا توجد دروس متاحة بعد.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
