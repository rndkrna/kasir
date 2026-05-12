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
    if (confirm('Hapus meja ini? Semua QR code untuk meja ini tidak akan berlaku.')) {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchTables();
      } else {
        alert('Gagal menghapus meja: ' + error.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c19]">Manajemen Meja</h1>
          <p className="text-sm text-[#43493c]">Kelola nomor meja yang tersedia di kafe</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + Tambah Meja
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#eeeee9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fafaf5] border-b border-[#eeeee9]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">ID Meja</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Nomor Meja</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeee9]">
              {tables.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#43493c]">Belum ada meja yang terdaftar</td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id} className="hover:bg-[#fafaf5] transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-[#43493c]">{table.id}</td>
                    <td className="px-6 py-4 font-bold text-[#1a1c19]">Meja {table.nomor_meja}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-[#ba1a1a] hover:underline font-semibold text-sm"
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
            <Button type="submit" loading={submitting}>
              Simpan Meja
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
