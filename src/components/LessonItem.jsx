import React from 'react';

const LessonItem = ({ lesson, isActive, onClick }) => {
  return (
    <div 
      className={`lesson-item glass-panel ${isActive ? 'active' : ''}`} 
      onClick={() => onClick(lesson)}
    >
      <div className="lesson-info">
        <span className="lesson-number">{lesson.order_index}</span>
        <h4 className="lesson-title">{lesson.title}</h4>
      </div>
    </div>
  );
};

export default LessonItem;
