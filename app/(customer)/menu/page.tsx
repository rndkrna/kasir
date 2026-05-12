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
      // 1. Get Table UUID
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('nomor_meja', parseInt(tableNumber))
        .single();

      if (tableError || !tableData) throw new Error('Meja tidak ditemukan');

      // 2. Insert Order
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
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#385e16] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#cefda3] rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#385e16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1c19] mb-2">Pesanan Terkirim!</h1>
        <p className="text-[#43493c]">Silakan tunggu, pesanan Anda sedang kami siapkan.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-[#385e16] font-semibold underline"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50 pb-40 font-sans">
      <header className="p-6 pb-2 sticky top-0 bg-brand-50/80 backdrop-blur-md z-30">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-brand-500 tracking-tighter uppercase italic">Artisan Brews</h1>
          <button className="p-2 text-ink-primary hover:bg-brand-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <h2 className="text-3xl font-black text-ink-primary">Our Menu</h2>
          <p className="text-ink-secondary text-sm mt-1 leading-tight">Discover our carefully crafted beverages and bites.</p>
        </div>

        <div className="mt-6">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </header>

      <div className="p-4 mt-2 space-y-8">
        {categories.filter(c => c !== 'semua').map(cat => {
          const itemsInCategory = filteredMenus.filter(m => m.kategori === cat);
          if (itemsInCategory.length === 0) return null;
          if (activeCategory !== 'semua' && activeCategory !== cat) return null;

          return (
            <div key={cat} className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a1c19] px-2 border-l-4 border-[#385e16] ml-1">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </h2>
              <div className="grid grid-cols-2 gap-4">
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
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#385e16] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
