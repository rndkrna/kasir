import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch initial orders: 
  // 1. Status 'baru' or 'diproses'
  // 2. OR Status 'selesai' but payment_status 'belum_bayar'
  useEffect(() => {
    const fetchInitialOrders = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (nomor_meja),
          order_items (*)
        `)
        .or('status.in.(baru,diproses),and(status.eq.selesai,payment_status.eq.belum_bayar)')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };

    fetchInitialOrders();

    // Subscribe to Realtime channel
    const channel = supabase
      .channel('kasir-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              tables (nomor_meja),
              order_items (*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setOrders((prev) => [data as unknown as Order, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        async (payload) => {
          // Check if the order should still be on dashboard
          const isOngoing = ['baru', 'diproses'].includes(payload.new.status);
          const isUnpaidFinished = payload.new.status === 'selesai' && payload.new.payment_status === 'belum_bayar';
          
          if (!isOngoing && !isUnpaidFinished) {
            // Remove from dashboard if finished and paid or cancelled
            setOrders((prev) => prev.filter((o) => o.id !== payload.new.id));
          } else {
            // Update the order in state, fetch full data if items or tables needed
            const { data, error } = await supabase
              .from('orders')
              .select(`
                *,
                tables (nomor_meja),
                order_items (*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setOrders((prev) => {
                const exists = prev.find(o => o.id === data.id);
                if (exists) {
                  return prev.map(o => o.id === data.id ? data as unknown as Order : o);
                } else {
                  return [data as unknown as Order, ...prev];
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    return { error };
  };

  return { orders, loading, updateOrderStatus };
};
