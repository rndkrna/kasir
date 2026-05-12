import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        className={`h-12 px-4 rounded-lg bg-surface border-2 border-surface-container text-ink placeholder:text-[#c3c9b8] focus:outline-none focus:border-primary transition-colors disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error font-medium">{error}</span>
      )}
    </div>
  );
};
