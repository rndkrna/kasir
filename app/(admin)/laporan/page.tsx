'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
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

  return (
    <div className="bg-surface-soft min-h-screen pb-32 font-sans">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-ink-primary">Laporan Penjualan</h1>
            <p className="text-sm text-ink-secondary font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={fetchLaporan}
            className="p-2.5 bg-surface-white border border-surface-border rounded-lg hover:bg-surface-soft transition-all text-brand-500 shadow-sm"
            title="Refresh Data"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${showFilters ? 'bg-brand-500 text-ink-inverse border-brand-500 shadow-md' : 'bg-surface-white text-ink-primary border-surface-border hover:bg-surface-soft'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Filter Tanggal
            </button>

            {showFilters && (
              <div className="absolute top-full left-0 mt-3 p-6 bg-surface-white rounded-xl border border-surface-border shadow-2xl z-50 w-80 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-ink-secondary mb-2 block tracking-widest">Dari Tanggal</label>
                    <input type="date" className="w-full p-3 rounded-lg border border-surface-border text-sm font-bold outline-none focus:border-brand-500 bg-surface-soft" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-ink-secondary mb-2 block tracking-widest">Sampai Tanggal</label>
                    <input type="date" className="w-full p-3 rounded-lg border border-surface-border text-sm font-bold outline-none focus:border-brand-500 bg-surface-soft" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>
                <Button fullWidth onClick={() => setShowFilters(false)}>Terapkan</Button>
              </div>
            )}
          </div>

          <div className="bg-surface-muted p-1 rounded-lg flex w-full sm:w-auto">
            {(['harian', 'mingguan', 'bulanan'] as const).map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-surface-white text-brand-500 shadow-sm border border-surface-border/50' : 'text-ink-secondary hover:text-ink-primary'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-white p-6 rounded-xl border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-ink-secondary tracking-widest">Total Pendapatan</p>
              <h2 className="text-3xl font-bold text-ink-primary tracking-tight font-mono">
                {formatRupiah(metrics.totalRevenue)}
              </h2>
            </div>
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-500 border border-brand-100">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>

          <div className="bg-surface-white p-6 rounded-xl border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-ink-secondary tracking-widest">Jumlah Pesanan</p>
              <h2 className="text-3xl font-bold text-ink-primary tracking-tight">{metrics.totalFinished}</h2>
            </div>
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-500 border border-brand-100">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>

          <div className="bg-surface-white p-6 rounded-xl border border-surface-border shadow-sm flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-ink-secondary tracking-widest">Menu Terlaris</p>
              <h2 className="text-xl font-bold text-ink-primary truncate w-full">{topSellingItems[0]?.name || '-'}</h2>
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-tight">{topSellingItems[0]?.qty || 0} unit terjual</p>
            </div>
          </div>
        </div>

        {/* Vertical Chart */}
        <div className="bg-surface-white p-6 md:p-8 rounded-xl border border-surface-border shadow-sm space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-ink-primary tracking-tight capitalize">
                Statistik {viewMode}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-ink-secondary uppercase tracking-widest">Periode</p>
              <p className="text-xs font-bold text-ink-primary uppercase">{new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="flex items-end justify-around h-64 gap-1.5 sm:gap-4 px-2">
            {chartData.map((data, idx) => {
              const height = (data.total / maxRevenue) * 100;
              const barWidth = chartData.length > 20 ? 'w-2' : 'w-6';
              const shouldShowLabel = chartData.length > 20 ? (idx % 4 === 0) : true;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group min-w-0">
                  <div className="relative w-full flex flex-col items-center justify-end h-48">
                    <div className="absolute -top-10 bg-ink-primary text-ink-inverse text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 shadow-xl z-20 pointer-events-none whitespace-nowrap font-mono font-bold">
                       {data.label}: {formatRupiah(data.total)}
                       <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-ink-primary rotate-45"></div>
                    </div>
                    <div 
                      className={`${barWidth} rounded-t-lg ${data.total > 0 ? 'bg-brand-500 shadow-sm' : 'bg-surface-muted'} group-hover:bg-brand-600 transition-colors`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                    </div>
                  </div>
                  <span className={`text-[8px] font-bold text-ink-secondary uppercase tracking-tighter transition-opacity ${shouldShowLabel ? 'opacity-100' : 'opacity-0'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-surface-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-surface-border">
            <h2 className="text-xl font-bold text-ink-primary tracking-tight">Transaksi Terakhir</h2>
            <button className="text-xs font-bold text-brand-500 hover:underline uppercase tracking-widest">Detail Lengkap</button>
          </div>
          <div className="divide-y divide-surface-border">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 px-6 hover:bg-surface-soft transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-soft rounded-lg flex items-center justify-center text-ink-secondary group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-ink-primary font-mono text-sm">#{order.id.slice(-4).toUpperCase()}</p>
                    <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-tight">
                      {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {order.tables?.nomor_meja === 0 ? 'Manual' : `Meja ${order.tables?.nomor_meja}`}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-ink-primary font-mono">
                  {formatRupiah(order.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
