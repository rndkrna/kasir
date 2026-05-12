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

  // Sound playback logic - trigger when orders list grows
  const [lastOrderCount, setLastOrderCount] = useState(0);
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      play();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, play]);

  // Auth Check
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

  // Fetch all orders today for stats (including 'selesai')
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
    
    // Subscribe for stats updates
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="p-4 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Dashboard Kasir</h1>
        <div className="flex items-center gap-4">
          <SoundToggle isEnabled={isEnabled} onToggle={toggle} />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-ink-variant uppercase">Real-time Aktif</span>
          </div>
        </div>
      </header>

      <StatsBar totalOrders={stats.total} totalRevenue={stats.revenue} />

      <main className="flex-1 p-4">
        {orders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-ink-variant border-2 border-dashed border-surface-container rounded-2xl">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-semibold italic">Belum ada pesanan aktif</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
