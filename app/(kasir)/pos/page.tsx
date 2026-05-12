'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, Table, Order } from '@/types';
import { MenuCard } from '@/components/customer/MenuCard';
import { CategoryTabs } from '@/components/customer/CategoryTabs';
import { CartBar } from '@/components/customer/CartBar';
import { formatRupiah } from '@/lib/utils';
import { ReceiptPreview } from '@/components/ui/ReceiptPreview';
import { useCart } from '@/hooks/useCart';

export default function CashierPOSPage() {
  const supabase = createClient();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const {
    items,
    notes,
    setNotes,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  useEffect(() => {
    async function fetchData() {
      const [menusRes, tablesRes] = await Promise.all([
        supabase.from('menus').select('*').order('urutan', { ascending: true }),
        supabase.from('tables').select('*').order('nomor_meja', { ascending: true })
      ]);

      if (menusRes.data) setMenus(menusRes.data);
      if (tablesRes.data) setTables(tablesRes.data);
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menus.map((m) => m.kategori)));
    return ['semua', ...cats];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    if (activeCategory === 'semua') return menus;
    return menus.filter((m) => m.kategori === activeCategory);
  }, [menus, activeCategory]);

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      let targetTableId = '';
      const { data: existingTable } = await supabase
        .from('tables')
        .select('id')
        .eq('nomor_meja', 0)
        .single();

      if (existingTable) {
        targetTableId = existingTable.id;
      } else {
        const { data: newTable, error: createError } = await supabase
          .from('tables')
          .insert({ nomor_meja: 0 })
          .select()
          .single();
        if (createError) throw createError;
        targetTableId = newTable.id;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const cashierName = user?.user_metadata?.full_name || user?.email || 'Staff';

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: targetTableId,
          status: 'selesai',
          payment_status: 'sudah_bayar',
          total: totalPrice,
          catatan: notes,
          kasir_name: cashierName,
        })
        .select('*, tables(*)')
        .single();

      if (orderError || !orderData) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_id: item.id,
        nama_menu: item.nama,
        harga_saat_pesan: item.harga,
        qty: item.qty,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setLastOrder(orderData as any);
      setSuccess(true);
      setLastOrderId(orderData.id);
      clearCart();
    } catch (error) {
      alert('Gagal memproses transaksi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = async () => {
    if (!lastOrderId) return;
    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        body: JSON.stringify({ order_id: lastOrderId }),
      });
      const data = await res.json();
      if (data.success) alert('Struk sedang dicetak');
      else alert('Gagal cetak: ' + data.error);
    } catch (err) {
      alert('Kesalahan jaringan saat mencetak');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center bg-surface-soft min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-screen bg-surface-soft">
        <div className="w-16 h-16 bg-status-selesai-bg rounded-full flex items-center justify-center mb-4 border border-status-selesai-border">
          <svg className="w-8 h-8 text-status-selesai-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink-primary mb-2">Transaksi Selesai!</h1>
        <p className="text-sm text-ink-secondary mb-8">Pembayaran telah diterima dan tercatat di riwayat.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-12">
          <button 
            onClick={handlePrint} 
            className="flex-1 bg-ink-primary hover:bg-black text-ink-inverse font-semibold text-sm px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Struk
          </button>
          <button 
            onClick={() => setSuccess(false)} 
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-ink-inverse font-semibold text-sm px-4 py-3 rounded-lg transition-all"
          >
            Transaksi Baru
          </button>
        </div>

        {lastOrder && (
          <div className="w-full max-w-xs mx-auto text-left">
            <p className="text-center text-[10px] font-semibold text-ink-muted uppercase mb-3 tracking-widest">Pratinjau Struk</p>
            <div className="bg-surface-white p-1 rounded-xl border border-surface-border shadow-sm">
              <ReceiptPreview order={lastOrder} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-40">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-surface-white p-4 md:p-5 rounded-xl border border-surface-border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink-primary">KAFÉ POS</h1>
              <p className="text-xs text-ink-secondary">Pesan langsung di kasir</p>
            </div>
          </div>
        </div>

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              item={menu}
              qty={items.find((i) => i.id === menu.id)?.qty || 0}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </div>

      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        notes={notes}
        onNotesChange={setNotes}
        onSubmit={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
