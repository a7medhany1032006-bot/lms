import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, User, Mail, Calendar, BookOpen,
  CheckCircle, ClipboardList, Activity, Circle,
  TrendingUp, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../services/api';

const formatDate = (d, withTime = false) => {
  if (!d) return '—';
  try {
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
    return new Date(d).toLocaleDateString('ar-EG', opts);
  } catch { return d; }
};

const ProgressBar = ({ value, color = '#3B82F6' }) => (
  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '100px', height: '6px', overflow: 'hidden', flex: 1 }}>
    <div style={{ height: '100%', borderRadius: '100px', background: value >= 100 ? '#10b981' : `linear-gradient(90deg, ${color}, #8B5CF6)`, width: `${Math.min(value, 100)}%`, transition: 'width 0.6s ease' }} />
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="glass-panel" style={{ borderRadius: '16px', marginBottom: '1.5rem', padding: '1.75rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
      {icon}
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExam, setExpandedExam] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stuRes, progRes, examRes] = await Promise.all([
          api.get(`/admin/students/${id}`),
          api.get(`/admin/students/${id}/progress`),
          api.get(`/admin/students/${id}/exams`)
        ]);
        setStudent(stuRes.data.data);
        setProgress(progRes.data.data || []);
        setExams(examRes.data.data || []);
      } catch (err) {
        setError('فشل تحميل بيانات الطالب.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="loading" style={{ paddingTop: '4rem' }}>جاري تحميل بيانات الطالب...</div>;
  if (error) return <div className="admin-page"><div className="error-message">{error}</div></div>;
  if (!student) return null;

  // Computed stats
  const totalLessonsCompleted = progress.reduce((sum, c) => sum + c.completedLessons, 0);
  const completedCourses = progress.filter(c => c.progress === 100).length;
  const avgScore = exams.length > 0
    ? Math.round(exams.reduce((sum, e) => sum + (e.total_questions > 0 ? (e.score / e.total_questions) * 100 : 0), 0) / exams.length)
    : null;

  // Build activity timeline
  const activities = [];
  progress.forEach(course => {
    course.lessons?.forEach(lesson => {
      if (lesson.is_completed) activities.push({ type: 'completed', label: `أكمل الدرس: ${lesson.lesson_title}`, sub: course.course_title, ts: lesson.last_accessed });
      else activities.push({ type: 'viewed', label: `شاهد الدرس: ${lesson.lesson_title}`, sub: course.course_title, ts: lesson.last_accessed });
    });
  });
  exams.forEach(e => {
    activities.push({ type: 'exam', label: `قدّم اختبار: ${e.exam_title}`, sub: `${e.score}/${e.total_questions} — ${e.passed ? 'ناجح' : 'يحتاج مراجعة'}`, ts: e.submitted_at });
  });
  activities.sort((a, b) => new Date(b.ts) - new Date(a.ts));

  const actColor = (t) => t === 'completed' ? '#10b981' : t === 'exam' ? '#8B5CF6' : '#3B82F6';
  const actIcon = (t) => t === 'completed'
    ? <CheckCircle size={15} style={{ color: '#10b981' }} />
    : t === 'exam' ? <ClipboardList size={15} style={{ color: '#8B5CF6' }} />
    : <BookOpen size={15} style={{ color: '#3B82F6' }} />;

  return (
    <div className="admin-page" style={{ maxWidth: 900 }}>
      {/* Back */}
      <Link to="/admin/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowRight size={16} /> العودة لقائمة الطلاب
      </Link>

      {/* Student Header */}
      <div className="glass-panel" style={{
        borderRadius: '20px', padding: '2rem 2.5rem', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.07) 100%)',
        borderColor: 'rgba(59,130,246,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
          }}>
            {(student.full_name || 'ط').charAt(0)}
          </div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{student.full_name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Mail size={14} /> {student.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Calendar size={14} /> انضم: {formatDate(student.created_at)}
              </span>
            </div>
          </div>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'الدورات', value: progress.length, color: '#3B82F6' },
              { label: 'مكتملة', value: completedCourses, color: '#10b981' },
              { label: 'الاختبارات', value: exams.length, color: '#8B5CF6' },
              { label: 'متوسط الدرجات', value: avgScore !== null ? avgScore + '%' : '—', color: avgScore >= 50 ? '#10b981' : '#ef4444' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', minWidth: 80 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <Section title="تقدم الدورات" icon={<TrendingUp size={20} style={{ color: 'var(--primary)' }} />}>
        {progress.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', margin: 0 }}>لم يبدأ أي دورة بعد.</p>
        ) : progress.map(course => (
          <div key={course.course_id} style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {course.progress === 100
                  ? <CheckCircle size={16} style={{ color: '#10b981' }} />
                  : <BookOpen size={16} style={{ color: '#3B82F6' }} />
                }
                <span style={{ fontWeight: 600, color: '#fff' }}>{course.course_title}</span>
                {course.progress === 100 && (
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 600 }}>مكتملة</span>
                )}
              </div>
              <span style={{ fontWeight: 700, color: course.progress === 100 ? '#10b981' : 'var(--primary)', fontSize: '0.9rem' }}>
                {course.completedLessons}/{course.totalLessons} دروس ({course.progress}%)
              </span>
            </div>
            <ProgressBar value={course.progress} />
          </div>
        ))}
      </Section>

      {/* Exam History */}
      <Section title="سجل الاختبارات" icon={<ClipboardList size={20} style={{ color: '#8B5CF6' }} />}>
        {exams.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', margin: 0 }}>لم يؤدِ أي اختبار بعد.</p>
        ) : exams.map(exam => (
          <div key={exam.id} style={{ marginBottom: '0.9rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid ' + (exam.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)') }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', flexWrap: 'wrap' }}
              onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: exam.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {exam.passed ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <XCircle size={18} style={{ color: '#ef4444' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{exam.exam_title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{exam.course_title} · {formatDate(exam.submitted_at, true)}</div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: exam.passed ? '#10b981' : '#ef4444' }}>{exam.score}/{exam.total_questions}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.total_questions > 0 ? Math.round(exam.score / exam.total_questions * 100) : 0}%</div>
              </div>
              <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                {expandedExam === exam.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Essay Answers Accordion */}
            {expandedExam === exam.id && (
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>إجابات الأسئلة المقالية:</div>
                {typeof exam.answers_json === 'object' && Object.keys(exam.answers_json).length > 0 ? (
                  Object.entries(exam.answers_json).map(([qid, ans]) => (
                    <div key={qid} style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>س{qid}: </span>
                      <span style={{ color: '#fff' }}>{ans || 'لم يجب'}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>لا توجد إجابات مقالية مسجلة.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </Section>

      {/* Activity Timeline */}
      <Section title="سجل النشاط" icon={<Activity size={20} style={{ color: 'var(--accent)' }} />}>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', margin: 0 }}>لا يوجد نشاط مسجل.</p>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: '16px', top: 0, bottom: 0, width: '2px', background: 'var(--border-color)', zIndex: 0 }} />
            {activities.slice(0, 20).map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', border: `2px solid ${actColor(act.type)}`, boxShadow: `0 0 0 3px rgba(${act.type === 'completed' ? '16,185,129' : act.type === 'exam' ? '139,92,246' : '59,130,246'},0.15)` }}>
                  {actIcon(act.type)}
                </div>
                <div style={{ flex: 1, paddingTop: '0.3rem' }}>
                  <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 500 }}>{act.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                    {act.sub} · {formatDate(act.ts, true)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default StudentDetails;
