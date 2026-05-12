import { Order } from '@/types';

interface StatusBadgeProps {
  status: Order['status'];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    baru: 'bg-[#ffca98] text-[#7a532a]',
    diproses: 'bg-[#cefda3] text-[#2b5008]',
    selesai: 'bg-[#c2f198] text-[#0c2000]',
    dibatalkan: 'bg-[#ffdad6] text-[#93000a]',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};
