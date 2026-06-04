import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/api';
import { BookOpen, Video, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ courses: 0, lessons: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const coursesRes = await getCourses();
        const coursesData = coursesRes.data.data || coursesRes.data;
        const totalCourses = Array.isArray(coursesData) ? coursesData.length : 0;
        
        // In a real app we might have a dedicated endpoint for total lessons.
        // For the MVP, we just show courses count and a mock lessons count.
        setStats({ courses: totalCourses, lessons: totalCourses * 3 }); 
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="dashboard-page">
      <h1 className="mb-4 text-white">نظرة عامة</h1>
      <div className="stats-grid flex" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
        
        <div className="stat-card glass-panel flex items-center" style={{ gap: '1rem', flex: '1 1 250px' }}>
          <div className="stat-icon" style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: 'var(--primary)' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="text-muted" style={{ fontSize: '1rem' }}>إجمالي الدورات</h3>
            <p className="text-white" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.courses}</p>
          </div>
        </div>

        <div className="stat-card glass-panel flex items-center" style={{ gap: '1rem', flex: '1 1 250px' }}>
          <div className="stat-icon" style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px', color: 'var(--secondary)' }}>
            <Video size={32} />
          </div>
          <div>
            <h3 className="text-muted" style={{ fontSize: '1rem' }}>إجمالي الدروس (تقريبي)</h3>
            <p className="text-white" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.lessons}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
