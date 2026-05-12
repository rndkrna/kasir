'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MenuItem } from '@/types';
import { MenuCard } from '@/components/customer/MenuCard';
import { CategoryTabs } from '@/components/customer/CategoryTabs';
import { CartBar } from '@/components/customer/CartBar';
import { useCart } from '@/hooks/useCart';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table');
  const supabase = createClient();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    async function fetchMenus() {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('urutan', { ascending: true });

      if (!error && data) {
        setMenus(data);
      }
      setLoading(false);
    }

    fetchMenus();
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
    if (!tableNumber) {
      alert('Nomor meja tidak ditemukan. Silakan scan QR ulang.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('nomor_meja', parseInt(tableNumber))
        .single();

      if (tableError || !tableData) throw new Error('Meja tidak ditemukan');

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableData.id,
          status: 'baru',
          total: totalPrice,
          catatan: notes,
        })
        .select()
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

      setSuccess(true);
      clearCart();
    } catch (error: unknown) {
      console.error('Order Error:', error);
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      alert('Gagal mengirim pesanan: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-status-selesai-bg border border-status-selesai-border rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-500/5">
          <svg className="w-10 h-10 text-status-selesai-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink-primary mb-2">Pesanan Terkirim!</h1>
        <p className="text-sm text-ink-secondary max-w-[250px]">Silakan tunggu sebentar, pesanan Anda sedang kami siapkan.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-10 px-8 py-3 bg-brand-500 text-ink-inverse rounded-lg font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-soft pb-40 font-sans max-w-md mx-auto shadow-2xl shadow-black/5 relative">
      <header className="p-6 pb-2 sticky top-0 bg-surface-white/90 backdrop-blur-md z-30 border-b border-surface-border">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
              <span className="text-ink-inverse text-xs font-bold">K</span>
            </div>
            <h1 className="text-xl font-bold text-brand-500 tracking-tight">KAFÉ POS</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-brand-50 border border-brand-100 rounded-full">
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Meja {tableNumber}</span>
             </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-ink-primary tracking-tight">Daftar Menu</h2>
          <p className="text-ink-secondary text-xs mt-1 leading-tight">Pilih kopi dan makanan favorit Anda hari ini.</p>
        </div>

        <div className="mt-6">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </header>

      <div className="p-4 mt-2 space-y-10">
        {categories.filter(c => c !== 'semua').map(cat => {
          const itemsInCategory = filteredMenus.filter(m => m.kategori === cat);
          if (itemsInCategory.length === 0) return null;
          if (activeCategory !== 'semua' && activeCategory !== cat) return null;

          return (
            <div key={cat} className="space-y-4">
              <h2 className="text-sm font-bold text-ink-primary px-3 py-1 bg-surface-muted inline-block rounded-md uppercase tracking-widest">
                {cat}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {itemsInCategory.map((menu) => (
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
          );
        })}
      </div>

      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        notes={notes}
        onNotesChange={setNotes}
        onSubmit={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
