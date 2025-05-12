import React from 'react';
import { ErrorMessageProps } from '@/types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div 
      className="slide-up"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#f28b82",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        maxWidth: "90%",
        width: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: "500" }}>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          marginLeft: "8px"
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorMessage; 