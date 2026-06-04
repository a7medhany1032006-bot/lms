import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card glass-panel">
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        <Link to={`/course/${course.id}`} className="btn btn-primary mt-4">
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
