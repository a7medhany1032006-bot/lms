import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/dashboard/profile');
        setProfile(res.data.data);
        setFullName(res.data.data.full_name || '');
        setEmail(res.data.data.email || '');
      } catch {
        toast.error('فشل تحميل بيانات الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error('الرجاء إدخال جميع البيانات');
      return;
    }
    setSaving(true);
    try {
      await api.put('/dashboard/profile', { full_name: fullName.trim(), email: email.trim() });
      setProfile(prev => ({ ...prev, full_name: fullName.trim(), email: email.trim() }));
      setEditMode(false);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setEmail(profile?.email || '');
    setEditMode(false);
  };

  if (loading) return <div className="loading">جاري تحميل الملف الشخصي...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>ملفي الشخصي</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>عرض وتعديل معلوماتك الشخصية</p>
      </div>

      {/* Avatar Section */}
      <div className="glass-panel" style={{
        borderRadius: '20px', padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 100%)',
        marginBottom: '1.5rem', textAlign: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
        }}>
          {(profile?.full_name || 'ط').charAt(0)}
        </div>
        <h2 style={{ marginBottom: '0.25rem' }}>{profile?.full_name}</h2>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(139,92,246,0.1)', color: 'var(--secondary)',
          padding: '0.25rem 0.85rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600
        }}>
          <Shield size={13} />
          {profile?.role === 'admin' ? 'مدير النظام' : 'طالب'}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>البيانات الشخصية</h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.9rem' }}
            >
              <Edit3 size={15} /> تعديل
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <User size={14} /> الاسم الكامل
            </label>
            {editMode ? (
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={saving}
              />
            ) : (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', color: '#fff' }}>
                {profile?.full_name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <Mail size={14} /> البريد الإلكتروني
            </label>
            {editMode ? (
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={saving}
              />
            ) : (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', color: '#fff' }}>
                {profile?.email}
              </div>
            )}
          </div>

          {/* Role — always read-only */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <Shield size={14} /> نوع الحساب
            </label>
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              {profile?.role === 'admin' ? 'مدير النظام' : 'طالب'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editMode && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '10px', padding: '0.85rem' }}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              onClick={handleCancel}
              className="btn"
              style={{ flex: 1, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.85rem' }}
              disabled={saving}
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
