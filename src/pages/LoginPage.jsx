import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/grades');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', zIndex: -1 }}></div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', borderRadius: '24px' }}>
        <div className="text-center mb-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📚</span>
            <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>هاني دويدار - عربي بالأرقام</h1>
          </div>
          <h2 className="text-white" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>تسجيل الدخول</h2>
          <p className="text-muted">مرحباً بك مجدداً في منصتك التعليمية</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group mb-4">
            <label className="form-label text-muted">البريد الإلكتروني</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingRight: '2.8rem' }}
                placeholder="أدخل بريدك الإلكتروني..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label text-muted">كلمة المرور</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingRight: '2.8rem' }}
                placeholder="أدخل كلمة المرور..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '12px' }} disabled={submitting}>
            {submitting ? 'جاري التحقق...' : 'دخول لحسابي'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            ليس لديك حساب؟ <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
