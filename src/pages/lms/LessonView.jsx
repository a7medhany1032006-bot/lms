import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLessonById, getCourseById } from '../../services/api';
import api from '../../services/api';
import { Home, ArrowRight, ArrowLeft, CheckCircle, Circle, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  return url;
};

// Convert Google Drive share link to an embeddable preview URL
const getPdfEmbedUrl = (url) => {
  if (!url) return null;
  // Match: https://drive.google.com/file/d/FILE_ID/view or /edit etc.
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  // For direct PDF links, return as-is (iframe will handle it)
  return url;
};

const LessonView = () => {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const trackProgress = useCallback(async (lessonId, completed = false) => {
    if (!user) return;
    try {
      await api.post(`/lessons/${lessonId}/progress`, { is_completed: completed });
    } catch (err) {
      console.error('Progress tracking error:', err);
    }
  }, [user]);

  const fetchProgress = useCallback(async (lessonId) => {
    if (!user) return;
    try {
      const res = await api.get(`/lessons/${lessonId}/progress`);
      setIsCompleted(!!res.data.data?.is_completed);
    } catch (err) {
      console.error('Fetch progress error:', err);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonRes = await getLessonById(lessonId);
        const lessonData = lessonRes.data.data || lessonRes.data;
        setLesson(lessonData);
        if (lessonData?.course_id) {
          const courseRes = await getCourseById(lessonData.course_id);
          setCourse(courseRes.data.data || courseRes.data);
        }

        // Track as "viewed" immediately on open
        await trackProgress(lessonId, false);
        // Fetch actual completion status
        await fetchProgress(lessonId);
      } catch {
        setError('تعذر تحميل الدرس. يرجى المحاولة لاحقاً.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId, trackProgress, fetchProgress]);

  const handleMarkComplete = async () => {
    if (isCompleted) return;
    setMarkingComplete(true);
    try {
      await api.post(`/lessons/${lessonId}/progress`, { is_completed: true });
      setIsCompleted(true);
      toast.success('تم تمييز الدرس كمكتمل! 🎉');
    } catch {
      toast.error('فشل تحديث حالة الدرس');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  const embedUrl = getYouTubeEmbedUrl(lesson?.video_url);
  const pdfEmbedUrl = getPdfEmbedUrl(lesson?.pdf_url);

  const currentIndex = course?.lessons ? course.lessons.findIndex(l => String(l.id) === String(lessonId)) : -1;
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

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
        {course && (
          <>
            <Link to={`/courses/${course.id}/lessons`} className="breadcrumb-item">{course.title}</Link>
            <span className="breadcrumb-sep">›</span>
          </>
        )}
        <span className="breadcrumb-item active">{lesson?.title}</span>
      </nav>

      {/* Back button */}
      {course && (
        <Link to={`/courses/${course.id}/lessons`} className="btn btn-secondary mb-4"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRight size={16} /> العودة للدروس
        </Link>
      )}

      {/* Lesson title */}
      <h1 className="lms-title mb-4">{lesson?.title}</h1>

      {/* Video Player */}
      <div className="lesson-view-player glass-panel">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson?.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="lesson-iframe"
          />
        ) : (
          <div className="video-placeholder">
            <p className="text-muted">لا يوجد فيديو لهذا الدرس.</p>
          </div>
        )}
      </div>

      {/* PDF Section */}
      {lesson?.pdf_url && (
        <div className="glass-panel" style={{ marginTop: '1.5rem', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={18} style={{ color: '#a78bfa' }} />
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>ملف الدرس</span>
            </div>
            <a
              href={lesson.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.85rem', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.35)', borderRadius: '8px' }}
            >
              <ExternalLink size={14} /> فتح PDF
            </a>
          </div>
          <iframe
            src={pdfEmbedUrl}
            title="ملف الدرس"
            width="100%"
            height="520"
            style={{ border: 'none', display: 'block', background: '#1a1a2e' }}
            allow="autoplay"
          />
        </div>
      )}

      {/* Progress Bar — only for students */}
      {user && (
        <div className="glass-panel" style={{ marginTop: '1.5rem', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isCompleted
              ? <CheckCircle size={22} style={{ color: '#10b981' }} />
              : <Circle size={22} style={{ color: 'var(--text-muted)' }} />
            }
            <div>
              <div style={{ fontWeight: 600, color: isCompleted ? '#10b981' : '#fff' }}>
                {isCompleted ? 'تم إكمال هذا الدرس ✓' : 'هل أكملت هذا الدرس؟'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isCompleted ? 'تم احتساب هذا الدرس في تقدمك' : 'ضع علامة اكتمال لتتبع تقدمك'}
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', padding: '0.65rem 1.25rem' }}
            >
              <CheckCircle size={16} />
              {markingComplete ? 'جاري الحفظ...' : 'تمييز كمكتمل'}
            </button>
          )}
        </div>
      )}
      {/* Navigation */}
      {course?.lessons && (
        <div className="lesson-nav-buttons">
          {prevLesson ? (
            <Link to={`/lessons/${prevLesson.id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRight size={16} /> الدرس السابق
            </Link>
          ) : (
            <button className="btn btn-secondary" disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
              <ArrowRight size={16} /> الدرس السابق
            </button>
          )}

          {nextLesson ? (
            <Link to={`/lessons/${nextLesson.id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              الدرس التالي <ArrowLeft size={16} />
            </Link>
          ) : (
            <button className="btn btn-primary" disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
              الدرس التالي <ArrowLeft size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonView;
