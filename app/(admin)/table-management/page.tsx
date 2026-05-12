'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Table } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomorMeja, setNomorMeja] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const supabase = createClient();

  const fetchTables = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('nomor_meja', { ascending: true });

    if (!error && data) {
      setTables(data as unknown as Table[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('tables')
      .insert([{ nomor_meja: parseInt(nomorMeja) }]);

    if (!error) {
      setNomorMeja('');
      setIsModalOpen(false);
      fetchTables();
    } else {
      alert('Gagal menambah meja: ' + error.message);
    }
    setSubmitting(false);
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm('Hapus meja ini? Data meja akan dihapus permanen. Meja tidak bisa dihapus jika masih memiliki riwayat pesanan.')) {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchTables();
      } else {
        if (error.code === '23503') {
          alert('Gagal menghapus meja: Meja ini masih memiliki riwayat pesanan di database. Selesaikan atau hapus pesanan terkait terlebih dahulu.');
        } else {
          alert('Gagal menghapus meja: ' + error.message);
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Manajemen Meja</h1>
          <p className="text-sm text-ink-secondary">Kelola nomor meja yang tersedia di kafe</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-ink-inverse rounded-lg"
        >
          + Tambah Meja
        </Button>
      </div>

      <div className="bg-surface-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-soft border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-secondary">ID Meja</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-secondary">Nomor Meja</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-ink-muted">Memuat data...</td>
                </tr>
              ) : tables.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-ink-muted">Belum ada meja yang terdaftar</td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-ink-muted">{table.id}</td>
                    <td className="px-6 py-4 font-bold text-ink-primary">Meja {table.nomor_meja}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-red-600 hover:text-red-700 hover:underline font-semibold text-sm transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Meja Baru"
      >
        <form onSubmit={handleAddTable} className="space-y-4">
          <Input
            label="Nomor Meja"
            type="number"
            placeholder="Contoh: 1"
            value={nomorMeja}
            onChange={(e) => setNomorMeja(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
              className="bg-brand-500 hover:bg-brand-600 text-ink-inverse"
            >
              Simpan Meja
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
