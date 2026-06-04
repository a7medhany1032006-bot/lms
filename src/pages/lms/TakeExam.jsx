import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExamById, getQuestionsByExamId, submitExam } from '../../services/api';
import { ClipboardList, Clock, Home, BookOpen, AlertCircle, CheckCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TakeExam = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Student State
  const [studentName, setStudentName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, qRes] = await Promise.all([
          getExamById(examId),
          getQuestionsByExamId(examId)
        ]);
        setExam(examRes.data.data || examRes.data);
        const qData = qRes.data.data || qRes.data;
        setQuestions(Array.isArray(qData) ? qData : []);
      } catch {
        setError('تعذر تحميل بيانات الاختبار.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const handleAnswerChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error('الرجاء إدخال اسمك الرباعي');
      return;
    }
    setHasStarted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitExam(examId, { student_name: studentName, answers });
      setSubmissionResult(res.data.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('حدث خطأ أثناء تسليم الاختبار. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;

  return (
    <div className="container lms-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4">
        <Link to="/grades" className="breadcrumb-item"><Home size={14} /> الرئيسية</Link>
        <span className="breadcrumb-sep">›</span>
        {exam?.course_id && (
          <>
            <Link to={`/courses/${exam.course_id}/lessons`} className="breadcrumb-item">الدورة</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to={`/courses/${exam.course_id}/exam`} className="breadcrumb-item">الاختبارات</Link>
            <span className="breadcrumb-sep">›</span>
          </>
        )}
        <span className="breadcrumb-item active">{exam?.title}</span>
      </nav>

      <div className="lms-page-header">
        <div className="flex items-center" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.2)', borderRadius: '12px', color: '#60A5FA' }}>
            <ClipboardList size={28} />
          </div>
          <h1 className="lms-title" style={{ marginBottom: 0 }}>{exam?.title}</h1>
        </div>
        {exam?.description && <p className="lms-subtitle text-muted">{exam.description}</p>}
        {exam?.time_limit && (
          <div className="flex items-center" style={{ gap: '0.5rem', color: 'var(--accent)', marginTop: '0.75rem' }}>
            <Clock size={16} /> المدة الزمنية: {exam.time_limit} دقيقة
          </div>
        )}
      </div>

      {submissionResult ? (
        <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
          <CheckCircle size={64} style={{ color: '#10B981', margin: '0 auto 1.5rem' }} />
          <h2 className="text-white" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>تم تسليم الاختبار بنجاح يا {studentName}!</h2>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem' }}>
            <p className="text-muted mb-2">درجتك في أسئلة الاختيارات</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {submissionResult.score} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ {submissionResult.total_questions}</span>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>* يتم تقييم الأسئلة المقالية يدوياً بواسطة المعلم.</p>
          </div>

          <div>
            <Link to={`/courses/${exam?.course_id}/exam`} className="btn">العودة للاختبارات</Link>
          </div>
        </div>
      ) : !hasStarted ? (
        <div className="glass-panel text-center" style={{ padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
          <User size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 className="text-white mb-2">بيانات الطالب</h2>
          <p className="text-muted mb-4">الرجاء إدخال اسمك الرباعي قبل البدء في الاختبار.</p>
          <form onSubmit={handleStart}>
            <input 
              type="text" 
              className="form-input mb-4 text-center" 
              placeholder="الاسم الرباعي..." 
              value={studentName} 
              onChange={e => setStudentName(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary w-full">بدء الاختبار</button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="exam-questions-form">
          {questions.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <p className="text-muted">لم يتم إضافة أسئلة لهذا الاختبار بعد.</p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div key={q.id} className="question-card glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h3 className="question-text text-white mb-3">
                    <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span> {q.question_text}
                  </h3>
                  
                  {q.question_type === 'mcq' ? (
                    <div className="options-list">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const optText = q[`option_${opt.toLowerCase()}`];
                        if (!optText) return null;
                        return (
                          <label key={opt} className="option-label" style={{ 
                            display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            <div className="flex items-center" style={{ gap: '0.75rem' }}>
                              <input type="radio" name={`question_${q.id}`} value={opt} 
                                checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} required />
                              <span className="text-white">{optText}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="essay-answer">
                      <textarea className="form-input" rows={5} placeholder="اكتب إجابتك هنا..."
                        value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} required></textarea>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="text-center" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }} disabled={submitting}>
                  {submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default TakeExam;
