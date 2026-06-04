import React, { useState, useEffect } from 'react';
import { getCourses, getGrades, createCourse, updateCourse, deleteCourse } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', grade_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, courseId: null });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const fetchData = async () => {
    try {
      const [coursesRes, gradesRes] = await Promise.all([getCourses(), getGrades()]);
      const cData = coursesRes.data.data || coursesRes.data;
      const gData = gradesRes.data.data || gradesRes.data;
      setCourses(Array.isArray(cData) ? cData : []);
      setGrades(Array.isArray(gData) ? gData : []);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', grade_id: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description || '', grade_id: course.grade_id || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'العنوان مطلوب';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const payload = { ...formData, grade_id: formData.grade_id ? parseInt(formData.grade_id) : null };
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        toast.success('تم تحديث الدورة بنجاح');
      } else {
        await createCourse(payload);
        toast.success('تم إنشاء الدورة بنجاح');
      }
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteModal.courseId);
      toast.success('تم حذف الدورة بنجاح');
      setDeleteModal({ open: false, courseId: null });
      fetchData();
    } catch {
      toast.error('فشل حذف الدورة');
    }
  };

  const getGradeName = (gradeId) => {
    const g = grades.find(g => g.id == gradeId);
    return g ? g.name : '—';
  };

  const filteredCourses = courses.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const paginatedCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="admin-page-header flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
        <h1 className="text-white">إدارة الدورات</h1>
        <button className="btn" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> إضافة دورة
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '400px', maxWidth: '90vw' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white">{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">الصف الدراسي</label>
                <select className="form-input" value={formData.grade_id} onChange={e => setFormData({ ...formData, grade_id: e.target.value })}>
                  <option value="">-- بدون صف --</option>
                  {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">عنوان الدورة *</label>
                <input
                  className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="أدخل عنوان الدورة"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                {formErrors.title && <span className="error-msg">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">وصف الدورة</label>
                <textarea className="form-input" placeholder="أدخل وصف الدورة" rows={3}
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex" style={{ gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : (editingCourse ? 'تحديث الدورة' : 'إنشاء الدورة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={deleteModal.open} title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف جميع الدروس المرتبطة بها."
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, courseId: null })} />

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : courses.length === 0 && !search ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">لا توجد دورات بعد.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={16} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input"
                placeholder="البحث باسم الدورة أو الوصف..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingRight: '2.5rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
              />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {filteredCourses.length} دورة
            </span>
          </div>

          <div className="admin-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>الصف</th><th>العنوان</th><th>الوصف</th><th>الإجراءات</th></tr>
              </thead>
            <tbody>
              {paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    لا توجد دورات مطابقة للبحث
                  </td>
                </tr>
              ) : paginatedCourses.map((course, idx) => (
                <tr key={course.id}>
                  <td className="text-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td><span className="grade-badge">{getGradeName(course.grade_id)}</span></td>
                  <td className="text-white" style={{ fontWeight: 600 }}>{course.title}</td>
                  <td className="text-muted">{course.description ? course.description.substring(0, 50) + '...' : '—'}</td>
                  <td>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(course)}><Pencil size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ open: true, courseId: course.id })}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn" style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: page === 1 ? 'var(--text-muted)' : '#fff', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="btn" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', minWidth: 36, fontWeight: p === page ? 700 : 400, background: p === page ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid ' + (p === page ? 'var(--primary)' : 'var(--border-color)'), fontSize: '0.9rem' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn" style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: page === totalPages ? 'var(--text-muted)' : '#fff', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
