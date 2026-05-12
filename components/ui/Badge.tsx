import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'baru' | 'diproses' | 'selesai' | 'dibatalkan' | 'habis' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const baseStyles = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center';
  
  const variants = {
    baru: 'bg-[#ffca98] text-[#7a532a]',
    diproses: 'bg-[#cefda3] text-[#2b5008]',
    selesai: 'bg-[#c2f198] text-[#0c2000]',
    dibatalkan: 'bg-[#ffdad6] text-[#93000a]',
    habis: 'bg-[#ffdad6] text-[#93000a]',
    default: 'bg-[#eeeee9] text-[#43493c]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
