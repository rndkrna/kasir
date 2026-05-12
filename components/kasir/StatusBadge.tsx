import { Order } from '@/types';

interface StatusBadgeProps {
  status: Order['status'];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    baru: 'bg-status-baru-bg text-status-baru-text border-status-baru-border',
    diproses: 'bg-status-diproses-bg text-status-diproses-text border-status-diproses-border',
    selesai: 'bg-status-selesai-bg text-status-selesai-text border-status-selesai-border',
    dibatalkan: 'bg-status-habis-bg text-status-habis-text border-status-habis-border',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border font-sans ${styles[status]}`}>
      {status}
    </span>
  );
};
