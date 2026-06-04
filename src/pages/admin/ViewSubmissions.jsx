import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExamById, getSubmissionsByExamId } from '../../services/api';
import { ArrowRight, Users, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';

const ViewSubmissions = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, subRes] = await Promise.all([
          getExamById(examId),
          getSubmissionsByExamId(examId)
        ]);
        setExam(examRes.data.data || examRes.data);
        const subData = subRes.data.data || subRes.data;
        setSubmissions(Array.isArray(subData) ? subData : []);
      } catch (err) {
        toast.error('فشل تحميل بيانات النتائج');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('ar-EG', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="admin-page">
      <div className="mb-4">
        <Link to="/admin/exams" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRight size={16} /> العودة للاختبارات
        </Link>
      </div>

      <div className="admin-page-header flex items-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-white flex items-center" style={{ gap: '0.5rem' }}>
            <Users size={24} style={{ color: 'var(--primary)' }}/> نتائج الطلاب
          </h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>{exam?.title}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p className="text-muted text-lg">لم يقم أي طالب بتسليم هذا الاختبار حتى الآن.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الطالب</th>
                <th>الدرجة (أسئلة الاختيارات)</th>
                <th>وقت التسليم</th>
                <th>الإجابات المقالية</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => {
                const percentage = (sub.score / sub.total_questions) * 100;
                let color = '#EF4444'; // Red
                if (percentage >= 80) color = '#10B981'; // Green
                else if (percentage >= 50) color = '#F59E0B'; // Yellow

                return (
                  <tr key={sub.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td className="text-white" style={{ fontWeight: 600 }}>{sub.student_name}</td>
                    <td>
                      <div className="flex items-center" style={{ gap: '0.5rem' }}>
                        <span style={{ 
                          background: `${color}20`, color: color, 
                          padding: '0.25rem 0.75rem', borderRadius: '12px', 
                          fontWeight: 'bold', fontSize: '0.9rem' 
                        }}>
                          {sub.score} / {sub.total_questions}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted flex items-center" style={{ gap: '0.4rem', fontSize: '0.9rem' }}>
                        <Clock size={14} /> {formatDate(sub.submitted_at)}
                      </span>
                    </td>
                    <td>
                      {sub.essay_answers && sub.essay_answers.length > 0 ? (
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setSelectedSubmission(sub)}>
                          <Eye size={14} /> عرض الإجابات
                        </button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>لا يوجد</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white flex items-center" style={{ gap: '0.5rem' }}>
                <Eye size={20} /> إجابات مقالية: {selectedSubmission.student_name}
              </h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedSubmission.essay_answers.map((ans, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 className="text-white mb-2" style={{ fontSize: '0.95rem' }}><span style={{ color: 'var(--primary)' }}>س:</span> {ans.question_text}</h4>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {ans.student_answer}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex mt-4" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
