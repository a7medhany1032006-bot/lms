import React from 'react';

const Modal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <h3 className="mb-4 text-white">{title}</h3>
        <p className="mb-4">{message}</p>
        <div className="flex" style={{ gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>إلغاء</button>
          <button className="btn" style={{backgroundColor: '#ef4444', color: 'white'}} onClick={onConfirm}>تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
