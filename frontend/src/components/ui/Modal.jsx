import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className={`relative transform overflow-hidden rounded-lg bg-surface text-left shadow-xl transition-all sm:my-8 w-full ${maxWidth} border border-border`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
