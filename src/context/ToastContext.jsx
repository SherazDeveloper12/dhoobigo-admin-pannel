import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast 
              key={toast.id} 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 10000;
          display: flex;
          flex-direction: column-reverse;
          gap: 12px;
          pointer-events: none;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
