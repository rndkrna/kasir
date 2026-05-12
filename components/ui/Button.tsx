import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-brand-500 text-ink-inverse hover:bg-brand-600 active:bg-brand-700 shadow-sm active:shadow-none transition-colors duration-150',
    secondary: 'bg-surface-muted hover:bg-surface-border text-ink-primary border border-surface-border transition-colors duration-150',
    ghost: 'bg-transparent text-ink-secondary hover:bg-surface-muted transition-colors duration-150',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-150',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs rounded-md',
    md: 'h-12 px-6 text-sm rounded-lg', // Min-height 48px approx
    lg: 'h-14 px-8 text-base rounded-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
