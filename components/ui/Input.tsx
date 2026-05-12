import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <label className="text-sm font-bold text-ink-primary">
          {label}
        </label>
      )}
      <input
        className={`h-12 px-4 rounded-lg bg-surface-soft border border-surface-border text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 font-medium ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-status-habis-text font-bold uppercase tracking-tight">{error}</span>
      )}
    </div>
  );
};
