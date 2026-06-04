import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, User, FileText, Calendar, Target, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const EssayReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await api.get(`/admin/essay-submissions/${submissionId}`);
        const data = res.data.data;
        setSubmission(data);
        
        // Initialize state for grades
        const initGrades = {};
        data.essays?.forEach(e => {
          initGrades[e.id] = {
            score: e.essay_score ?? 0,
            comment: e.teacher_comment || '',
            max_score: e.max_score || 5
          };
        });
        setGrades(initGrades);
      } catch (err) {
        setError('فشل تحميل تفاصيل الإجابة.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleGradeChange = (essayId, field, value) => {
    setGrades(prev => {
      const current = { ...prev };
      if (field === 'score') {
        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;
        if (num < 0) num = 0;
        if (num > current[essayId].max_score) num = current[essayId].max_score;
        current[essayId].score = num;
      } else {
        current[essayId][field] = value;
      }
      return current;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        grades: Object.keys(grades).map(id => ({
          essay_answer_id: parseInt(id, 10),
          score: grades[id].score,
          comment: grades[id].comment
        }))
      };
      
      await api.put(`/admin/essay-submissions/${submissionId}/grade`, payload);
      toast.success('تم حفظ التقييم بنجاح');
      navigate('/admin/essay-grading');
    } catch (err) {
      toast.error('فشل حفظ التقييم');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading" style={{ paddingTop: '4rem' }}>جاري تحميل تفاصيل التقييم...</div>;
  if (error || !submission) return <div className="admin-page"><div className="error-message">{error || 'لم يتم العثور على التسليم'}</div></div>;

  return (
    <div className="admin-page" style={{ maxWidth: 900 }}>
      {/* Header */}
      <Link to="/admin/essay-grading" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowRight size={16} /> العودة لقائمة التقييم
      </Link>

      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} />
            {submission.exam_title}
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} /> الطالب: <strong style={{ color: '#fff' }}>{submission.student_name}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> الدورة: <strong style={{ color: '#fff' }}>{submission.course_title}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> تاريخ التسليم: <strong style={{ color: '#fff' }}>{new Date(submission.submitted_at).toLocaleDateString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })}</strong>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Target size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>نقاط الاختيار من متعدد</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginTop: '0.25rem' }}>
            {submission.mcq_score} / {submission.total_questions}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        الأسئلة المقالية ({submission.essays?.length || 0})
      </h3>

      {/* Essay Questions List */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {submission.essays?.map((essay, idx) => (
          <div key={essay.id} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            {/* Question */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '6px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6, color: '#fff' }}>
                  {essay.question_text}
                </div>
              </div>
            </div>

            {/* Answer */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>إجابة الطالب:</div>
              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '1rem', lineHeight: 1.8, color: '#f8fafc', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
                {essay.student_answer || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>لم يجب</span>}
              </div>

              {/* Grading Box */}
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(59,130,246,0.04)', borderRadius: '12px', border: '1px dashed rgba(59,130,246,0.2)' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--primary)' }}>تقييم المعلم</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  {/* Score */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>الدرجة المستحقة (من {grades[essay.id]?.max_score})</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        min="0" 
                        max={grades[essay.id]?.max_score}
                        value={grades[essay.id]?.score}
                        onChange={(e) => handleGradeChange(essay.id, 'score', e.target.value)}
                        className="form-input"
                        style={{ width: 100, fontSize: '1.1rem', textAlign: 'center', fontWeight: 700, color: '#10b981' }}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>/ {grades[essay.id]?.max_score}</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>تعليق المعلم (اختياري)</label>
                    <textarea 
                      value={grades[essay.id]?.comment}
                      onChange={(e) => handleGradeChange(essay.id, 'comment', e.target.value)}
                      className="form-input"
                      placeholder="أضف ملاحظاتك للطالب هنا..."
                      style={{ minHeight: 100, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Action */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-color)', position: 'sticky', bottom: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)' }}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1.1rem', borderRadius: '10px' }}
        >
          {saving ? 'جاري الحفظ...' : <><Save size={20} /> حفظ التقييم</>}
        </button>
      </div>
    </div>
  );
};

export default EssayReview;
