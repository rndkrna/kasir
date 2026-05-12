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
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  
  // Specific POS State
  const [selectedTableId, setSelectedTableId] = useState('');
  const [isPaidUpfront, setIsPaidUpfront] = useState(false);

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
      // 1. Get or Create "KASIR" Table
      let targetTableId = '';
      const { data: existingTable } = await supabase
        .from('tables')
        .select('id')
        .eq('nomor_meja', 0) // Kita gunakan 0 sebagai tanda pesanan Kasir/Manual
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

      // 2. Insert Order
      const { data: { user } } = await supabase.auth.getUser();
      const cashierName = user?.user_metadata?.full_name || user?.email || 'Staff';

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: targetTableId,
          status: 'selesai', // Langsung Selesai
          payment_status: 'sudah_bayar', // Langsung Lunas
          total: totalPrice,
          catatan: notes,
          kasir_name: cashierName,
        })
        .select()
        .single();

      if (orderError || !orderData) throw orderError;

      // 3. Insert Order Items
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

      // Success
      setSuccess(true);
      setLastOrderId(orderData.id); // Simpan ID untuk cetak struk
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
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-ink-primary mb-2">Transaksi Selesai!</h1>
        <p className="text-ink-secondary">Pembayaran telah diterima dan tercatat di riwayat.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-12">
          <button 
            onClick={handlePrint} 
            className="bg-ink-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-black transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Struk
          </button>
          <button 
            onClick={() => setSuccess(false)} 
            className="bg-brand-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            Input Transaksi Baru
          </button>
        </div>

        {/* Receipt Preview Section */}
        {lastOrder && (
          <div className="w-full max-w-md mx-auto text-left">
            <p className="text-center text-xs font-bold text-ink-muted uppercase mb-4 tracking-widest">Pratinjau Struk Digital</p>
            <div className="bg-surface-muted p-4 sm:p-8 rounded-3xl overflow-hidden border border-surface-border">
              <ReceiptPreview order={lastOrder} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 pb-40 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Artisan Brews POS Header */}
      <div className="bg-surface-white p-6 rounded-2xl border border-surface-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white text-xl font-black">K</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink-primary tracking-tight">KAFÉ POS</h1>
            <p className="text-sm text-ink-secondary">Pesan langsung di kasir (Counter Order)</p>
          </div>
        </div>
      </div>

      <div className="px-2">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
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
