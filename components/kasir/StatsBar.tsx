import { formatRupiah } from '@/lib/utils';

interface StatsBarProps {
  totalOrders: number;
  totalRevenue: number;
}

export const StatsBar = ({ totalOrders, totalRevenue }: StatsBarProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-white border-b border-[#eeeee9]">
      <div className="bg-[#fafaf5] p-4 rounded-xl border border-[#eeeee9]">
        <span className="text-xs font-bold text-[#43493c] uppercase tracking-wider block mb-1">Total Pesanan</span>
        <span className="text-2xl font-bold text-[#1a1c19]">{totalOrders}</span>
      </div>
      <div className="bg-[#f4f4ef] p-4 rounded-xl border border-[#eeeee9]">
        <span className="text-xs font-bold text-[#43493c] uppercase tracking-wider block mb-1">Pendapatan</span>
        <span className="text-2xl font-bold font-mono text-[#385e16]">{formatRupiah(totalRevenue)}</span>
      </div>
    </div>
  );
};
