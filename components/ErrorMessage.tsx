import React, { useEffect } from 'react';
import { ErrorMessageProps } from '@/types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="error-toast slide-up">
      <span className="error-toast-message">{message}</span>
      <button className="error-toast-close" onClick={onClose} aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default ErrorMessage;
