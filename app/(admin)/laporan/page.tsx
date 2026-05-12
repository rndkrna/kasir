'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { useLaporan } from '@/hooks/useLaporan';

export default function LaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClient();

  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const [dateFrom, setDateFrom] = useState(getLocalDate());
  const [dateTo, setDateTo] = useState(getLocalDate());

  const [viewMode, setViewMode] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');

  const { metrics, chartData, maxRevenue, topSellingItems, exportToCSV } = useLaporan(
    orders,
    viewMode,
    dateFrom,
    dateTo
  );

  const fetchLaporan = async () => {
    setLoading(true);
    
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), tables(nomor_meja)')
      .eq('status', 'selesai')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLaporan();
  }, [dateFrom, dateTo]);

  const handleExport = () => {
    exportToCSV(dateFrom, dateTo);
  };

  return (
    <div className="bg-[#fcfcf9] min-h-screen pb-32">
      {/* Header Section */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-[#1a1c19]">Laporan Harian</h1>
            <p className="text-ink-muted font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={fetchLaporan}
            className="p-3 bg-white border border-surface-border rounded-2xl hover:bg-brand-50 hover:border-brand-200 transition-all text-brand-500 shadow-sm"
            title="Refresh Data"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 bg-[#f0f0e8] px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${showFilters ? 'bg-brand-500 text-white' : 'text-ink-primary hover:bg-[#e6e6dc]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Pilih Tanggal
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 mt-3 p-6 bg-white rounded-[32px] border border-surface-border shadow-2xl z-50 w-80 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-ink-muted mb-2 block tracking-widest">Dari Tanggal</label>
                  <input type="date" className="w-full p-4 rounded-2xl border border-surface-border text-sm font-bold outline-none focus:border-brand-500" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-ink-muted mb-2 block tracking-widest">Sampai Tanggal</label>
                  <input type="date" className="w-full p-4 rounded-2xl border border-surface-border text-sm font-bold outline-none focus:border-brand-500" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
              <Button fullWidth onClick={() => setShowFilters(false)}>Terapkan</Button>
            </div>
          )}
        </div>

        {/* Tab Filter */}
        <div className="bg-[#f0f0e8] p-1 rounded-2xl flex">
          {(['harian', 'mingguan', 'bulanan'] as const).map((mode) => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${viewMode === mode ? 'bg-white text-ink-primary shadow-sm' : 'text-ink-muted'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Metric Cards */}
        <div className="space-y-4">
          {/* Card 1: Total Pendapatan */}
          <div className="bg-white p-6 rounded-[32px] border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">Total Pendapatan</p>
              <h2 className="text-4xl font-black text-ink-primary tracking-tighter">
                {formatRupiah(metrics.totalRevenue)}
              </h2>
              <p className="text-[10px] font-bold text-brand-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                +15.2% dari bulan lalu
              </p>
            </div>
            <div className="w-10 h-10 bg-[#eef3e8] rounded-2xl flex items-center justify-center text-brand-500">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>

          {/* Card 2: Jumlah Pesanan */}
          <div className="bg-white p-6 rounded-[32px] border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">Jumlah Pesanan</p>
              <h2 className="text-4xl font-black text-ink-primary tracking-tighter">{metrics.totalFinished.toLocaleString('id-ID')}</h2>
              <p className="text-[10px] font-bold text-[#b45309] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                +12% dari bulan lalu
              </p>
            </div>
            <div className="w-10 h-10 bg-[#fdf2e9] rounded-2xl flex items-center justify-center text-[#b45309]">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>

          {/* Card 3: Top Kategori */}
          <div className="bg-white p-6 rounded-[32px] border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">Top Kategori</p>
              <h2 className="text-2xl font-black text-ink-primary tracking-tighter">Signature Coffee</h2>
              <p className="text-[10px] font-bold text-ink-muted">{topSellingItems[0]?.qty || 0} terjual bulan ini</p>
            </div>
            <div className="w-10 h-10 bg-[#f3f4f1] rounded-2xl flex items-center justify-center text-ink-muted">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
          </div>
        </div>

        {/* Vertical Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-surface-border shadow-sm space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-ink-primary tracking-tighter capitalize">
                Pendapatan {viewMode}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-ink-muted uppercase">Periode Aktif</p>
              <p className="text-sm font-black text-ink-primary uppercase">{new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="flex items-end justify-around h-56 gap-1 sm:gap-2">
            {chartData.map((data, idx) => {
              const height = (data.total / maxRevenue) * 100;
              const isHigh = height > 60;
              
              // Gunakan lebar yang lebih pasti agar tidak collapse
              const barWidth = chartData.length > 20 ? 'w-2 sm:w-3' : 'w-4 sm:w-6';
              
              // Sembunyikan sebagian label jika terlalu padat (per jam)
              const shouldShowLabel = chartData.length > 20 ? (idx % 4 === 0) : true;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group min-w-0">
                  <div className="relative w-full flex flex-col items-center justify-end h-48">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-ink-primary text-white text-[9px] px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 shadow-xl z-20 pointer-events-none whitespace-nowrap font-mono font-bold">
                       {data.label}: Rp {(data.total / 1000).toFixed(0)}k
                       <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-ink-primary rotate-45"></div>
                    </div>

                    {/* Bar */}
                    <div 
                      className={`${barWidth} rounded-t-full ${data.total > 0 ? (isHigh ? 'bg-[#4a6732]' : 'bg-brand-500/40') : 'bg-[#e6e6dc]'} group-hover:bg-brand-600 transition-colors shadow-sm`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                    </div>
                  </div>
                  <span className={`text-[8px] sm:text-[9px] font-black text-ink-muted uppercase tracking-tighter transition-opacity ${shouldShowLabel ? 'opacity-100' : 'opacity-0'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-[32px] border border-surface-border shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-2xl font-black text-ink-primary tracking-tighter">Transaksi Terakhir</h2>
            <button className="text-xs font-black text-brand-500 hover:underline">Lihat Semua</button>
          </div>
          <div className="px-4 pb-8 space-y-4">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-[#fcfcf9] rounded-3xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f3f4f1] rounded-2xl flex items-center justify-center text-ink-muted">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <p className="font-black text-ink-primary">Order #{order.id.slice(0, 4)}</p>
                    <p className="text-[10px] font-bold text-ink-muted uppercase">
                      {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {order.tables?.nomor_meja === 0 ? 'Manual' : `Meja ${order.tables?.nomor_meja}`}
                    </p>
                  </div>
                </div>
                <p className="font-black text-ink-primary">
                  Rp {order.total >= 1000 ? `${(order.total / 1000).toFixed(0)}k` : order.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
