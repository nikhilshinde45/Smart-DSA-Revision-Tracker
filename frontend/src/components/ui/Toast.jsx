import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

let toastId = 0;
let addToastGlobal = null;

// Global toast function
export const toast = {
  success: (message) => addToastGlobal?.({ type: 'success', message }),
  error: (message) => addToastGlobal?.({ type: 'error', message }),
  info: (message) => addToastGlobal?.({ type: 'info', message }),
};

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success:
    'bg-green-500/10 border-green-500/30 text-green-500 dark:bg-green-500/20',
  error: 'bg-red-500/10 border-red-500/30 text-red-500 dark:bg-red-500/20',
  info: 'bg-primary-500/10 border-primary-500/30 text-primary-500 dark:bg-primary-500/20',
};

const ToastItem = ({ toast: t, onClose }) => {
  const Icon = ICONS[t.type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-lg min-w-[300px] max-w-[420px] ${STYLES[t.type]}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{t.message}</p>
      <button
        onClick={() => onClose(t.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, message }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
