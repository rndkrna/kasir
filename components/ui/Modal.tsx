import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-ink-primary/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative bg-surface-white w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 border border-surface-border">
        {/* Header */}
        <div className="p-5 md:px-6 border-b border-surface-border flex items-center justify-between bg-surface-soft/50 shrink-0">
          {title && <h3 className="text-xl font-bold text-ink-primary tracking-tight font-sans">{title}</h3>}
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-muted text-ink-secondary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};
