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
import { QRCodeDisplay } from '@/components/admin/QRCodeDisplay';

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'meja'>('menu');
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
    if (!error && data) setMenus(data);
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

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum);
    const { error } = await supabase.from('tables').insert({ 
      nomor_meja: num,
      qr_code_url: `${window.location.origin}/menu?table=${num}`
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-primary">Kelola Kafe</h1>
          <p className="text-sm text-ink-secondary">Atur menu makanan, minuman, dan daftar meja pelanggan</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-surface-border shadow-sm">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'menu' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-secondary hover:bg-surface-muted'}`}
          >
            Daftar Menu
          </button>
          <button 
            onClick={() => setActiveTab('meja')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'meja' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-secondary hover:bg-surface-muted'}`}
          >
            Daftar Meja
          </button>
        </div>
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-ink-primary uppercase tracking-wider">Katalog Produk</h2>
            <Button onClick={() => { setEditingItem(undefined); setIsMenuModalOpen(true); }} size="sm">
              + Tambah Produk
            </Button>
          </div>
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-muted border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted">Menu</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted">Kategori</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted text-right">Harga</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted text-center">Stok</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-ink-muted text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {menus.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.foto_url || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-xl object-cover border border-surface-border" />
                          <div>
                            <p className="font-black text-ink-primary">{item.nama}</p>
                            <p className="text-[10px] text-ink-muted uppercase font-bold tracking-tight">Urutan #{item.urutan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge>{item.kategori}</Badge></td>
                      <td className="px-6 py-4 text-right font-mono font-black text-brand-500">{formatRupiah(item.harga)}</td>
                      <td className="px-6 py-4"><div className="flex justify-center"><StockToggle itemId={item.id} initialValue={item.is_available} onUpdate={fetchMenus} /></div></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingItem(item); setIsMenuModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                          <button onClick={() => { if(confirm('Hapus?')) supabase.from('menus').delete().eq('id', item.id).then(fetchMenus) }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-ink-primary uppercase tracking-wider">Lokasi & QR Code</h2>
            <Button onClick={() => setIsTableModalOpen(true)} size="sm">+ Tambah Meja</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-3xl border border-surface-border shadow-sm group hover:border-brand-500 transition-all flex flex-col overflow-hidden">
                {/* Top Number Badge */}
                <div className="p-4 flex items-center justify-center border-b border-surface-border bg-brand-50/30">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-brand-100 flex items-center justify-center text-brand-500 font-black text-lg">
                    {table.nomor_meja}
                  </div>
                </div>

                {/* QR Section */}
                <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <p className="font-black text-ink-primary text-xs uppercase tracking-widest">Meja {table.nomor_meja}</p>
                    <p className="text-[10px] text-ink-muted">Scan untuk pesan</p>
                  </div>
                  
                  <div className="w-full aspect-square max-w-[140px]">
                    <QRCodeDisplay tableNumber={table.nomor_meja} />
                  </div>
                </div>

                {/* Bottom Action */}
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
      <Modal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} title={editingItem ? 'Edit Produk' : 'Tambah Produk Baru'}>
        <MenuItemForm item={editingItem} onSuccess={() => { setIsMenuModalOpen(false); fetchMenus(); }} onCancel={() => setIsMenuModalOpen(false)} />
      </Modal>

      <Modal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} title="Tambah Meja Baru">
        <form onSubmit={handleAddTable} className="space-y-4">
          <div><label className="block text-xs font-black uppercase text-ink-muted mb-2">Nomor Meja</label>
          <input type="number" required autoFocus className="w-full p-4 rounded-2xl border border-surface-border focus:border-brand-500 outline-none font-black text-xl" value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} /></div>
          <Button type="submit" fullWidth>Simpan Meja</Button>
        </form>
      </Modal>
    </div>
  );
}
