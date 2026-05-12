import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch initial orders (baru & diproses) for today
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
        .in('status', ['baru', 'diproses'])
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
          // Fetch full data for the new order
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
        (payload) => {
          setOrders((prev) => {
            // If status is 'selesai' or 'dibatalkan', remove from current view
            if (['selesai', 'dibatalkan'].includes(payload.new.status)) {
              return prev.filter((o) => o.id !== payload.new.id);
            }
            // Otherwise update the order in state
            return prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o
            );
          });
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
