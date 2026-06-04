import React, { useState, useEffect } from 'react';
import { getGrades, createGrade, updateGrade, deleteGrade } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const ManageGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, gradeId: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchGrades = async () => {
    try {
      const res = await getGrades();
      const data = res.data.data || res.data;
      setGrades(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل تحميل الصفوف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, []);

  const openCreate = () => {
    setEditingGrade(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({ name: grade.name, description: grade.description || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'اسم الصف مطلوب';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      if (editingGrade) {
        await updateGrade(editingGrade.id, formData);
        toast.success('تم تحديث الصف بنجاح');
      } else {
        await createGrade(formData);
        toast.success('تم إنشاء الصف بنجاح');
      }
      setShowForm(false);
      fetchGrades();
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGrade(deleteModal.gradeId);
      toast.success('تم حذف الصف بنجاح');
      setDeleteModal({ open: false, gradeId: null });
      fetchGrades();
    } catch {
      toast.error('فشل حذف الصف');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
        <h1 className="text-white">إدارة الصفوف الدراسية</h1>
        <button className="btn" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> إضافة صف
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '380px', maxWidth: '90vw' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white">{editingGrade ? 'تعديل الصف' : 'إضافة صف جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">اسم الصف *</label>
                <input
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="مثال: الصف الأول"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">وصف الصف</label>
                <textarea
                  className="form-input"
                  placeholder="وصف اختياري للصف الدراسي"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex" style={{ gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : (editingGrade ? 'تحديث الصف' : 'إنشاء الصف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الصف؟ سيتم حذف جميع الدورات المرتبطة به."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, gradeId: null })}
      />

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : grades.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">لا توجد صفوف دراسية. ابدأ بإضافة صف!</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الصف</th>
                <th>الوصف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => (
                <tr key={grade.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td className="text-white" style={{ fontWeight: 600 }}>{grade.name}</td>
                  <td className="text-muted">{grade.description || '—'}</td>
                  <td>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(grade)} title="تعديل"><Pencil size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ open: true, gradeId: grade.id })} title="حذف"><Trash2 size={16} /></button>
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

export default ManageGrades;
