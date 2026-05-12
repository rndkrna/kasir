'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useSound } from '@/hooks/useSound';
import { OrderCard } from '@/components/kasir/OrderCard';
import { StatsBar } from '@/components/kasir/StatsBar';
import { SoundToggle } from '@/components/kasir/SoundToggle';
import { Order } from '@/types';

export default function KasirDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sessionLoading, setSessionLoading] = useState(true);
  const { orders, loading, updateOrderStatus } = useRealtimeOrders();
  const { isEnabled, toggle, play } = useSound();
  const [allOrdersToday, setAllOrdersToday] = useState<Order[]>([]);

  const [lastOrderCount, setLastOrderCount] = useState(0);
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      play();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, play]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      } else {
        setSessionLoading(false);
      }
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    async function fetchStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString());

      if (!error && data) {
        setAllOrdersToday(data as unknown as Order[]);
      }
    }
    fetchStats();
    
    const channel = supabase
      .channel('stats-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const stats = useMemo(() => {
    const finishedOrders = allOrdersToday.filter(o => o.status === 'selesai');
    const revenue = finishedOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      total: allOrdersToday.length,
      revenue
    };
  }, [allOrdersToday]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col font-sans">
      <header className="bg-surface-white border-b border-surface-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink-primary">Dashboard Kasir</h1>
          <div className="flex items-center gap-4">
            <SoundToggle isEnabled={isEnabled} onToggle={toggle} />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">Real-time Aktif</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <StatsBar totalOrders={stats.total} totalRevenue={stats.revenue} />

        <main className="flex-1 p-4">
          {orders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-ink-muted border-2 border-dashed border-surface-border rounded-xl bg-surface-white/50">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-semibold italic text-sm">Belum ada pesanan aktif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order.id} className={order.status === 'baru' ? 'animate-pulse' : ''}>
                   <OrderCard
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
