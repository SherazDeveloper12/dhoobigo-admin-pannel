import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const config = {
    success: { icon: <CheckCircle2 size={18} />, color: '#10B981', bg: '#ECFDF5', border: 'rgba(16,185,129,0.2)' },
    error: { icon: <AlertCircle size={18} />, color: '#EF4444', bg: '#FEF2F2', border: 'rgba(239,68,68,0.2)' },
    info: { icon: <Info size={18} />, color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)' },
  };

  const current = config[type] || config.info;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="toast-message"
      style={{
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        pointerEvents: 'auto',
      }}
    >
      <span className="toast-icon" style={{ color: current.color }}>{current.icon}</span>
      <p className="toast-text">{message}</p>
      <button className="toast-close" onClick={onClose}>
        <X size={14} color="#94A3B8" />
      </button>

      <style>{`
        .toast-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          min-width: 280px;
          max-width: 400px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .toast-icon { display: flex; align-items: center; justify-content: center; }
        .toast-text { flex: 1; font-size: 0.875rem; font-weight: 600; color: #1E293B; margin: 0; }
        .toast-close { 
          background: transparent; border: none; padding: 4px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; transition: background 0.2s;
        }
        .toast-close:hover { background: rgba(0,0,0,0.05); }
      `}</style>
    </motion.div>
  );
};

export default Toast;
