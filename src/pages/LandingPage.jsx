import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, ClipboardList, FileText, ArrowLeft, Star, Users, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section container" style={{ padding: '6rem 1rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)', zIndex: -1, borderRadius: '50%' }}></div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          المنصة التعليمية الأولى <br />
          <span style={{ color: 'var(--primary)' }}>لإتقان اللغة العربية</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          منصة "هاني دويدار - عربي بالأرقام" تقدم لك تجربة تعليمية متكاملة بأسلوب حديث ومبتكر، مصممة خصيصاً لتناسب احتياجات جميع المستويات.
        </p>
        <div className="flex justify-center" style={{ gap: '1rem' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', borderRadius: '50px' }}>
            ابدأ التعلم الآن <ArrowLeft size={20} />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container" style={{ padding: '4rem 1rem' }}>
        <div className="text-center mb-6">
          <h2 className="text-white" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>كل ما تحتاجه للنجاح</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>مميزات حصرية تضمن لك تفوقاً أكاديمياً وفهماً عميقاً للمادة.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel text-center" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <BookOpen size={30} />
            </div>
            <h3 className="text-white mb-2" style={{ fontSize: '1.3rem' }}>مناهج شاملة</h3>
            <p className="text-muted">دورات ودروس تغطي كافة فروع اللغة العربية بشكل منظم ومبسط.</p>
          </div>
          
          <div className="glass-panel text-center" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Video size={30} />
            </div>
            <h3 className="text-white mb-2" style={{ fontSize: '1.3rem' }}>دروس مرئية</h3>
            <p className="text-muted">شرح فيديو عالي الجودة لضمان إيصال المعلومة بأفضل طريقة ممكنة.</p>
          </div>

          <div className="glass-panel text-center" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(6,182,212,0.15)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ClipboardList size={30} />
            </div>
            <h3 className="text-white mb-2" style={{ fontSize: '1.3rem' }}>اختبارات تفاعلية</h3>
            <p className="text-muted">اختبارات دورية لقياس مستواك مع تصحيح آلي فوري وإجابات نموذجية.</p>
          </div>

          <div className="glass-panel text-center" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(16,185,129,0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <FileText size={30} />
            </div>
            <h3 className="text-white mb-2" style={{ fontSize: '1.3rem' }}>ملفات PDF</h3>
            <p className="text-muted">ملازم ومذكرات جاهزة للتحميل والطباعة لمراجعة الدروس في أي وقت.</p>
          </div>
        </div>
      </section>

      {/* Flow Section */}
      <section className="flow-section container" style={{ padding: '5rem 1rem 8rem' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
          <div className="text-center mb-6">
            <h2 className="text-white" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>كيف تبدأ رحلتك؟</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>خطوات بسيطة تفصلك عن التميز.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex items-center" style={{ gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <h4 className="text-white" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>اختر صفك الدراسي</h4>
                <p className="text-muted">ابدأ باختيار المرحلة الدراسية المناسبة لك للوصول إلى المحتوى المخصص.</p>
              </div>
            </div>

            <div className="flex items-center" style={{ gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <h4 className="text-white" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>تصفح الدورات والدروس</h4>
                <p className="text-muted">شاهد الفيديوهات الشارحة وحمل المذكرات المرفقة مع كل درس.</p>
              </div>
            </div>

            <div className="flex items-center" style={{ gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <h4 className="text-white" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>اختبر معلوماتك</h4>
                <p className="text-muted">قم بحل الاختبارات الإلكترونية لتقييم مستواك وتثبيت المعلومات.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
