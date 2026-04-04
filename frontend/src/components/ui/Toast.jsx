'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type, duration });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '280px',
            padding: '14px 20px',
            borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? '#198754' : toast.type === 'error' ? '#dc3545' : '#0d6efd',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            &times;
          </button>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
