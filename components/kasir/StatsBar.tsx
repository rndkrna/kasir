import { formatRupiah } from '@/lib/utils';

interface StatsBarProps {
  totalOrders: number;
  totalRevenue: number;
}

export const StatsBar = ({ totalOrders, totalRevenue }: StatsBarProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:p-6 bg-surface-white border-b border-surface-border">
      <div className="bg-surface-soft p-4 rounded-xl border border-surface-border shadow-sm">
        <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest block mb-1">Total Pesanan</span>
        <span className="text-2xl font-bold text-ink-primary">{totalOrders}</span>
      </div>
      <div className="bg-surface-soft p-4 rounded-xl border border-surface-border shadow-sm">
        <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest block mb-1">Total Pendapatan</span>
        <span className="text-2xl font-bold font-mono text-brand-500">{formatRupiah(totalRevenue)}</span>
      </div>
    </div>
  );
};
