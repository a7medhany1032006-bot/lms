import React, { useState, useEffect } from 'react';
import { getCourses, getLessonsByCourseId, createLesson, updateLesson, deleteLesson } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
const ManageLessons = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ title: '', video_url: '', pdf_url: '', order_index: 1 });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, lessonId: null });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  useEffect(() => {
    getCourses()
      .then(res => {
        const data = res.data.data || res.data;
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('فشل تحميل الدورات'));
  }, []);

  const fetchLessons = async (courseId) => {
    if (!courseId) return;
    setLoadingLessons(true);
    try {
      const res = await getLessonsByCourseId(courseId);
      const data = res.data.data || res.data;
      setLessons(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل تحميل الدروس');
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setLessons([]);
    fetchLessons(e.target.value);
  };

  const openCreate = () => {
    if (!selectedCourseId) { toast.error('يرجى اختيار دورة أولاً'); return; }
    setEditingLesson(null);
    setFormData({ title: '', video_url: '', pdf_url: '', order_index: lessons.length + 1 });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({ title: lesson.title, video_url: lesson.video_url, pdf_url: lesson.pdf_url || '', order_index: lesson.order_index });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'عنوان الدرس مطلوب';
    if (!formData.video_url.trim()) errors.video_url = 'رابط الفيديو مطلوب';
    if (formData.pdf_url && formData.pdf_url.trim() !== '') {
      if (!/^https?:\/\/.+/.test(formData.pdf_url.trim())) errors.pdf_url = 'رابط PDF غير صالح، يجب أن يبدأ بـ http:// أو https://';
    }
    if (!formData.order_index || parseInt(formData.order_index) < 1) errors.order_index = 'الترتيب يجب أن يكون رقمًا أكبر من 0';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const payload = {
        course_id: parseInt(selectedCourseId),
        title: formData.title,
        video_url: formData.video_url,
        pdf_url: formData.pdf_url && formData.pdf_url.trim() !== '' ? formData.pdf_url.trim() : null,
        order_index: parseInt(formData.order_index),
      };
      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);
        toast.success('تم تحديث الدرس بنجاح');
      } else {
        await createLesson(payload);
        toast.success('تم إنشاء الدرس بنجاح');
      }
      setShowForm(false);
      fetchLessons(selectedCourseId);
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLesson(deleteModal.lessonId);
      toast.success('تم حذف الدرس بنجاح');
      setDeleteModal({ open: false, lessonId: null });
      fetchLessons(selectedCourseId);
    } catch {
      toast.error('فشل حذف الدرس');
    }
  };

  const filteredLessons = lessons.filter(l =>
    (l.title || '').toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const paginatedLessons = filteredLessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="admin-page-header flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
        <h1 className="text-white">إدارة الدروس</h1>
        <button className="btn" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> إضافة درس
        </button>
      </div>

      {/* Course Selector */}
      <div className="glass-panel mb-4" style={{ padding: '1.25rem' }}>
        <label className="form-label">اختر الدورة لعرض دروسها</label>
        <select className="form-input" value={selectedCourseId} onChange={handleCourseChange} style={{ maxWidth: '400px' }}>
          <option value="">-- اختر دورة --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ minWidth: '400px', maxWidth: '90vw' }}>
            <div className="flex items-center mb-4" style={{ justifyContent: 'space-between' }}>
              <h3 className="text-white">{editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">عنوان الدرس *</label>
                <input
                  className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="أدخل عنوان الدرس"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                {formErrors.title && <span className="error-msg">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">رابط الفيديو *</label>
                <input
                  className={`form-input ${formErrors.video_url ? 'input-error' : ''}`}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                />
                {formErrors.video_url && <span className="error-msg">{formErrors.video_url}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">رابط ملف PDF <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(اختياري)</span></label>
                <input
                  className={`form-input ${formErrors.pdf_url ? 'input-error' : ''}`}
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.pdf_url}
                  onChange={e => setFormData({ ...formData, pdf_url: e.target.value })}
                />
                {formErrors.pdf_url && <span className="error-msg">{formErrors.pdf_url}</span>}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  تأكد من ضبط الرابط على "أي شخص لديه الرابط" في Google Drive.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">الترتيب *</label>
                <input
                  type="number"
                  min="1"
                  className={`form-input ${formErrors.order_index ? 'input-error' : ''}`}
                  value={formData.order_index}
                  onChange={e => setFormData({ ...formData, order_index: e.target.value })}
                />
                {formErrors.order_index && <span className="error-msg">{formErrors.order_index}</span>}
              </div>
              <div className="flex" style={{ gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : (editingLesson ? 'تحديث الدرس' : 'إنشاء الدرس')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, lessonId: null })}
      />

      {/* Lessons Table */}
      {!selectedCourseId ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">اختر دورة أعلاه لعرض دروسها وإدارتها.</p>
        </div>
      ) : loadingLessons ? (
        <div className="loading">جاري تحميل الدروس...</div>
      ) : lessons.length === 0 && !search ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">لا توجد دروس لهذه الدورة بعد.</p>
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
                placeholder="البحث باسم الدرس..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingRight: '2.5rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
              />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {filteredLessons.length} درس
            </span>
          </div>

          <div className="admin-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>عنوان الدرس</th>
                  <th>رابط الفيديو</th>
                  <th>ملف PDF</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLessons.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      لا توجد دروس مطابقة للبحث
                    </td>
                  </tr>
                ) : paginatedLessons.map(lesson => (
                <tr key={lesson.id}>
                  <td className="text-muted" style={{ textAlign: 'center' }}>{lesson.order_index}</td>
                  <td className="text-white" style={{ fontWeight: 600 }}>{lesson.title}</td>
                  <td>
                    <a href={lesson.video_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                      {lesson.video_url.length > 40 ? lesson.video_url.substring(0, 40) + '...' : lesson.video_url}
                    </a>
                  </td>
                  <td>
                    {lesson.pdf_url ? (
                      <a href={lesson.pdf_url} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', fontSize: '0.85rem' }}>
                        عرض PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(lesson)} title="تعديل">
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ open: true, lessonId: lesson.id })} title="حذف">
                        <Trash2 size={16} />
                      </button>
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

export default ManageLessons;
