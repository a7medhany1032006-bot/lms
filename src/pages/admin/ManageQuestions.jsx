import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExamById, getQuestionsByExamId, createQuestion, updateQuestion, deleteQuestion } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, ArrowRight, ListChecks, Type } from 'lucide-react';

const ManageQuestions = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({ 
    question_text: '', 
    question_type: 'mcq', 
    option_a: '', option_b: '', option_c: '', option_d: '', 
    correct_answer: 'A' 
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, questionId: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [examRes, qRes] = await Promise.all([getExamById(examId), getQuestionsByExamId(examId)]);
      setExam(examRes.data.data || examRes.data);
      const qData = qRes.data.data || qRes.data;
      setQuestions(Array.isArray(qData) ? qData : []);
    } catch { toast.error('فشل تحميل بيانات الأسئلة'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [examId]);

  const openCreate = () => {
    setEditingQuestion(null);
    setFormData({ question_text: '', question_type: 'mcq', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setFormData({ 
      question_text: q.question_text, 
      question_type: q.question_type, 
      option_a: q.option_a || '', option_b: q.option_b || '', 
      option_c: q.option_c || '', option_d: q.option_d || '', 
      correct_answer: q.correct_answer || 'A' 
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.question_text.trim()) errors.question_text = 'نص السؤال مطلوب';
    if (formData.question_type === 'mcq') {
      if (!formData.option_a.trim()) errors.option_a = 'الخيار مطلوب';
      if (!formData.option_b.trim()) errors.option_b = 'الخيار مطلوب';
      if (!formData.option_c.trim()) errors.option_c = 'الخيار مطلوب';
      if (!formData.option_d.trim()) errors.option_d = 'الخيار مطلوب';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const payload = { exam_id: examId, ...formData };
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        toast.success('تم تحديث السؤال بنجاح');
      } else {
        await createQuestion(payload);
        toast.success('تم إضافة السؤال بنجاح');
      }
      setShowForm(false);
      fetchData();
    } catch { toast.error('حدث خطأ أثناء حفظ السؤال'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestion(deleteModal.questionId);
      toast.success('تم حذف السؤال بنجاح');
      setDeleteModal({ open: false, questionId: null });
      fetchData();
    } catch { toast.error('فشل حذف السؤال'); }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="admin-page">
      <div className="mb-4">
        <Link to="/admin/exams" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRight size={16} /> العودة للاختبارات
        </Link>
      </div>

      <div className="admin-page-header flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-white">إدارة أسئلة الاختبار</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>{exam?.title}</p>
        </div>
        <button className="btn" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> إضافة سؤال
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white">{editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">نوع السؤال *</label>
                <div className="flex" style={{ gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                    <input type="radio" name="q_type" checked={formData.question_type === 'mcq'} onChange={() => setFormData({ ...formData, question_type: 'mcq' })} />
                    خيارات متعددة (MCQ)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                    <input type="radio" name="q_type" checked={formData.question_type === 'essay'} onChange={() => setFormData({ ...formData, question_type: 'essay' })} />
                    مقالي (Essay)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">نص السؤال *</label>
                <textarea className={`form-input ${formErrors.question_text ? 'input-error' : ''}`}
                  rows={3} placeholder="اكتب السؤال هنا"
                  value={formData.question_text} onChange={e => setFormData({ ...formData, question_text: e.target.value })} />
                {formErrors.question_text && <span className="error-msg">{formErrors.question_text}</span>}
              </div>

              {formData.question_type === 'mcq' && (
                <div className="options-container glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                  <h4 className="text-white mb-2" style={{ fontSize: '1rem' }}>الخيارات</h4>
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const field = `option_${opt.toLowerCase()}`;
                    return (
                      <div key={opt} className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input type="radio" name="correct_answer" value={opt} checked={formData.correct_answer === opt}
                          onChange={() => setFormData({ ...formData, correct_answer: opt })} title="اختر الإجابة الصحيحة" />
                        <span className="text-muted" style={{ minWidth: '20px', textAlign: 'center' }}>{opt}</span>
                        <input className={`form-input ${formErrors[field] ? 'input-error' : ''}`} style={{ flex: 1 }}
                          placeholder={`الخيار ${opt}`} value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
                      </div>
                    );
                  })}
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>حدد الدائرة بجانب الخيار الصحيح.</p>
                </div>
              )}

              <div className="flex" style={{ gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={deleteModal.open} title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا السؤال؟"
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, questionId: null })} />

      {questions.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">لا توجد أسئلة مضافة في هذا الاختبار.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>النوع</th><th>نص السؤال</th><th>الإجراءات</th></tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td>
                    {q.question_type === 'mcq' ? (
                      <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ListChecks size={12} /> اختيارات
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Type size={12} /> مقالي
                      </span>
                    )}
                  </td>
                  <td className="text-white" style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question_text}</td>
                  <td>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(q)}><Pencil size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ open: true, questionId: q.id })}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
