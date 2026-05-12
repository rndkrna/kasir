import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'baru' | 'diproses' | 'selesai' | 'dibatalkan' | 'habis' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const baseStyles = 'px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest inline-flex items-center justify-center font-sans';
  
  const variants = {
    baru: 'bg-status-baru-bg text-status-baru-text border border-status-baru-border',
    diproses: 'bg-status-diproses-bg text-status-diproses-text border border-status-diproses-border',
    selesai: 'bg-status-selesai-bg text-status-selesai-text border border-status-selesai-border',
    dibatalkan: 'bg-status-habis-bg text-status-habis-text border border-status-habis-border',
    habis: 'bg-status-habis-bg text-status-habis-text border border-status-habis-border',
    default: 'bg-surface-soft text-ink-secondary border border-surface-border',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
