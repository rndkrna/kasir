'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, Table } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StockToggle } from '@/components/admin/StockToggle';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { ModifierGroupManager } from '@/components/admin/ModifierGroupManager';
import { QRCodeDisplay } from '@/components/admin/QRCodeDisplay';

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'modifier' | 'meja'>('menu');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Menu State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  
  // Table State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  
  const supabase = createClient();

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('urutan', { ascending: true });
    
    if (error) {
      alert('Gagal mengambil data menu: ' + error.message);
    } else if (data) {
      setMenus(data);
    }
    setLoading(false);
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .neq('nomor_meja', 0)
      .order('nomor_meja', { ascending: true });
    if (!error && data) setTables(data as unknown as Table[]);
  };

  useEffect(() => {
    fetchMenus();
    fetchTables();
  }, []);

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Hapus menu ini?')) {
      const { error } = await supabase.from('menus').delete().eq('id', id);
      if (!error) fetchMenus();
      else alert('Gagal menghapus: ' + error.message);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum);
    const { error } = await supabase.from('tables').insert({ 
      nomor_meja: num
    });
    if (!error) {
      setNewTableNum('');
      setIsTableModalOpen(false);
      fetchTables();
    } else {
      alert('Gagal tambah meja: ' + error.message);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm('Hapus meja ini?')) {
      await supabase.from('tables').delete().eq('id', id);
      fetchTables();
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-primary">Manajemen Katalog</h1>
          <p className="text-sm text-ink-secondary">Kelola produk, modifier, dan daftar meja</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-surface-border shadow-sm">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'menu' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-secondary hover:bg-surface-muted'}`}
          >
            Produk
          </button>
          <button 
            onClick={() => setActiveTab('modifier')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'modifier' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-secondary hover:bg-surface-muted'}`}
          >
            Modifier
          </button>
          <button 
            onClick={() => setActiveTab('meja')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'meja' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-secondary hover:bg-surface-muted'}`}
          >
            Meja
          </button>
        </div>
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-ink-primary uppercase tracking-wider">Katalog Produk</h2>
              <p className="text-xs text-ink-secondary">Total {menus.length} item tersedia</p>
            </div>
            <Button onClick={() => { setEditingItem(undefined); setIsMenuModalOpen(true); }} size="sm">
              + Tambah Produk
            </Button>
          </div>
          
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-muted border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted tracking-widest">Menu</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted tracking-widest">Kategori</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted tracking-widest text-right">Harga</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted tracking-widest text-center">Stok</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : menus.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ink-muted text-sm italic">
                        Belum ada produk. Klik "+ Tambah Produk" untuk memulai.
                      </td>
                    </tr>
                  ) : (
                    menus.map((item) => (
                      <tr key={item.id} className="hover:bg-brand-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={item.foto_url || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-xl object-cover border border-surface-border shadow-sm" />
                              {!item.is_available && (
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Habis</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-ink-primary">{item.nama}</p>
                              <p className="text-[10px] text-ink-muted uppercase font-bold tracking-tight">Urutan #{item.urutan}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-surface-muted px-2 py-1 rounded-lg border border-surface-border">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-brand-500">{formatRupiah(item.harga)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <StockToggle 
                              itemId={item.id} 
                              initialValue={item.is_available} 
                              onUpdate={fetchMenus} 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingItem(item); setIsMenuModalOpen(true); }} 
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors border border-transparent hover:border-brand-100"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteMenu(item.id)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'modifier' ? (
        <ModifierGroupManager />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-ink-primary uppercase tracking-wider">Lokasi & QR Code</h2>
              <p className="text-xs text-ink-secondary">Total {tables.length} meja aktif</p>
            </div>
            <Button onClick={() => setIsTableModalOpen(true)} size="sm">+ Tambah Meja</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-3xl border border-surface-border shadow-sm group hover:border-brand-500 transition-all flex flex-col overflow-hidden">
                <div className="p-4 flex items-center justify-center border-b border-surface-border bg-brand-50/30">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-brand-100 flex items-center justify-center text-brand-500 font-black text-lg">
                    {table.nomor_meja}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <p className="font-black text-ink-primary text-xs uppercase tracking-widest">Meja {table.nomor_meja}</p>
                    <p className="text-[10px] text-ink-muted">Scan untuk pesan</p>
                  </div>
                  <div className="w-full aspect-square max-w-[140px]">
                    <QRCodeDisplay tableNumber={table.nomor_meja} />
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteTable(table.id)}
                  className="w-full py-4 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 border-t border-surface-border transition-colors tracking-widest"
                >
                  Hapus Meja
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal 
        isOpen={isMenuModalOpen} 
        onClose={() => setIsMenuModalOpen(false)} 
        title={editingItem ? 'Edit Produk' : 'Tambah Produk Baru'}
      >
        <MenuItemForm 
          item={editingItem} 
          onSuccess={() => { setIsMenuModalOpen(false); fetchMenus(); }} 
          onCancel={() => setIsMenuModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} title="Tambah Meja Baru">
        <form onSubmit={handleAddTable} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-ink-muted px-1">Nomor Meja</label>
            <input 
              type="number" 
              required 
              autoFocus 
              className="w-full h-14 p-4 rounded-2xl border border-surface-border focus:border-brand-500 outline-none font-black text-2xl text-ink-primary bg-surface-soft transition-all" 
              value={newTableNum} 
              onChange={(e) => setNewTableNum(e.target.value)} 
            />
          </div>
          <Button type="submit" fullWidth>Simpan Meja</Button>
        </form>
      </Modal>
    </div>
  );
}
