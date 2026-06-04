import React, { useState, useEffect } from 'react';
import { getCourses, getExams, createExam, updateExam, deleteExam } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({ course_id: '', title: '', description: '', time_limit: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, examId: null });
  const [submitting, setSubmitting] = useState(false);
  const [filterCourseId, setFilterCourseId] = useState('');

  const fetchData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([getExams(), getCourses()]);
      const eData = examsRes.data.data || examsRes.data;
      const cData = coursesRes.data.data || coursesRes.data;
      setExams(Array.isArray(eData) ? eData : []);
      setCourses(Array.isArray(cData) ? cData : []);
    } catch { toast.error('فشل تحميل البيانات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getCourseName = (id) => courses.find(c => c.id == id)?.title || '—';

  const filteredExams = filterCourseId
    ? exams.filter(e => e.course_id == filterCourseId)
    : exams;

  const openCreate = () => {
    setEditingExam(null);
    setFormData({ course_id: '', title: '', description: '', time_limit: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (exam) => {
    setEditingExam(exam);
    setFormData({ course_id: exam.course_id, title: exam.title, description: exam.description || '', time_limit: exam.time_limit || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.course_id) errors.course_id = 'يجب اختيار الدورة';
    if (!formData.title.trim()) errors.title = 'عنوان الاختبار مطلوب';
    if (formData.time_limit && (isNaN(formData.time_limit) || parseInt(formData.time_limit) < 1))
      errors.time_limit = 'المدة يجب أن تكون رقمًا صحيحًا';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const payload = {
        course_id: parseInt(formData.course_id),
        title: formData.title,
        description: formData.description,
        time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
      };
      if (editingExam) {
        await updateExam(editingExam.id, payload);
        toast.success('تم تحديث الاختبار بنجاح');
      } else {
        await createExam(payload);
        toast.success('تم إنشاء الاختبار بنجاح');
      }
      setShowForm(false);
      fetchData();
    } catch { toast.error('حدث خطأ، يرجى المحاولة مجدداً'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteExam(deleteModal.examId);
      toast.success('تم حذف الاختبار بنجاح');
      setDeleteModal({ open: false, examId: null });
      fetchData();
    } catch { toast.error('فشل حذف الاختبار'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
        <h1 className="text-white">إدارة الاختبارات</h1>
        <button className="btn" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> إضافة اختبار
        </button>
      </div>

      {/* Filter */}
      <div className="glass-panel mb-4" style={{ padding: '1.25rem' }}>
        <label className="form-label">تصفية حسب الدورة</label>
        <select className="form-input" value={filterCourseId} onChange={e => setFilterCourseId(e.target.value)} style={{ maxWidth: '400px' }}>
          <option value="">-- جميع الدورات --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '420px', maxWidth: '90vw' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white">{editingExam ? 'تعديل الاختبار' : 'إضافة اختبار جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">الدورة *</label>
                <select className={`form-input ${formErrors.course_id ? 'input-error' : ''}`}
                  value={formData.course_id} onChange={e => setFormData({ ...formData, course_id: e.target.value })}>
                  <option value="">-- اختر الدورة --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {formErrors.course_id && <span className="error-msg">{formErrors.course_id}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">عنوان الاختبار *</label>
                <input className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="أدخل عنوان الاختبار"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                {formErrors.title && <span className="error-msg">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">وصف الاختبار</label>
                <textarea className="form-input" rows={3} placeholder="وصف اختياري للاختبار"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">المدة الزمنية (بالدقائق)</label>
                <input type="number" min="1" className={`form-input ${formErrors.time_limit ? 'input-error' : ''}`}
                  placeholder="مثال: 30"
                  value={formData.time_limit} onChange={e => setFormData({ ...formData, time_limit: e.target.value })} />
                {formErrors.time_limit && <span className="error-msg">{formErrors.time_limit}</span>}
              </div>
              <div className="flex" style={{ gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : (editingExam ? 'تحديث الاختبار' : 'إنشاء الاختبار')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={deleteModal.open} title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع."
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, examId: null })} />

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : filteredExams.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">لا توجد اختبارات بعد.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>الدورة</th><th>عنوان الاختبار</th><th>المدة</th><th>الإجراءات</th></tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, idx) => (
                <tr key={exam.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td><span className="grade-badge">{getCourseName(exam.course_id)}</span></td>
                  <td className="text-white" style={{ fontWeight: 600 }}>{exam.title}</td>
                  <td>
                    {exam.time_limit ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)' }}>
                        <Clock size={14} /> {exam.time_limit} دقيقة
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <Link to={`/admin/exams/${exam.id}/questions`} className="icon-btn" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }} title="إدارة الأسئلة">
                        <Plus size={16} />
                      </Link>
                      <Link to={`/admin/exams/${exam.id}/submissions`} className="icon-btn" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' }} title="عرض النتائج">
                        <Users size={16} />
                      </Link>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(exam)}><Pencil size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ open: true, examId: exam.id })}><Trash2 size={16} /></button>
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

export default ManageExams;
