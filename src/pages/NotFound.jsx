import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center not-found-page">
      <div className="glass-panel" style={{ padding: '4rem', marginTop: '4rem' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <p className="mb-4">عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
        <Link to="/" className="btn btn-primary">العودة للرئيسية</Link>
      </div>
    </div>
  );
};

export default NotFound;
