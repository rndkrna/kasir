'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Table {
  id: string;
  nomor_meja: number;
  qr_code_url: string | null;
  created_at: string;
}

export default function ManajemenMejaPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomorMeja, setNomorMeja] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  const fetchTables = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .neq('nomor_meja', 0) // Jangan tampilkan meja virtual kasir
      .order('nomor_meja', { ascending: true });
    
    if (!error && data) setTables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('tables')
      .insert({ 
        nomor_meja: parseInt(nomorMeja),
        qr_code_url: `${window.location.origin}/menu?table=${nomorMeja}` 
      });

    if (error) {
      alert('Gagal menambah meja: ' + error.message);
    } else {
      setNomorMeja('');
      setIsModalOpen(false);
      fetchTables();
    }
    setIsSubmitting(false);
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Hapus meja ini?')) return;
    
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id);
    
    if (error) alert('Gagal menghapus meja');
    else fetchTables();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Manajemen Meja</h1>
          <p className="text-sm text-ink-secondary">Kelola daftar meja dan QR Code pelanggan</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + Tambah Meja
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <p>Memuat data meja...</p>
        ) : tables.length === 0 ? (
          <p className="col-span-full text-center py-12 text-ink-muted bg-white rounded-2xl border border-dashed border-surface-border">
            Belum ada meja terdaftar
          </p>
        ) : (
          tables.map((table) => (
            <div key={table.id} className="bg-white p-6 rounded-2xl border border-surface-border shadow-sm group hover:border-brand-500 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 font-black text-xl">
                  {table.nomor_meja}
                </div>
                <button 
                  onClick={() => handleDeleteTable(table.id)}
                  className="text-ink-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="font-bold text-ink-primary">Meja Nomor {table.nomor_meja}</h3>
              <p className="text-[10px] text-ink-muted mb-4 uppercase tracking-widest">Aktif sejak {new Date(table.created_at).toLocaleDateString()}</p>
              
              <div className="pt-4 border-t border-surface-border flex gap-2">
                 <button 
                   onClick={() => window.open(table.qr_code_url || '#', '_blank')}
                   className="flex-1 text-xs font-bold text-brand-500 bg-brand-50 py-2 rounded-lg hover:bg-brand-100 transition-colors"
                 >
                   Buka Menu QR
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Meja Baru"
      >
        <form onSubmit={handleAddTable} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink-primary mb-1">Nomor Meja</label>
            <input 
              type="number"
              required
              className="w-full p-3 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-bold"
              placeholder="Contoh: 12"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Meja'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
