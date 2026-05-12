'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ReceiptPreview } from '@/components/ui/ReceiptPreview';

export default function RiwayatPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const supabase = createClient();

  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTable, setFilterTable] = useState('');
  const [filterStatus, setFilterStatus] = useState('selesai');

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, tables(nomor_meja), order_items(*)')
      .order('created_at', { ascending: false });

    if (filterDate) {
      const start = `${filterDate}T00:00:00`;
      const end = `${filterDate}T23:59:59`;
      query = query.gte('created_at', start).lte('created_at', end);
    }

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data as unknown as Order[];
      if (filterTable) {
        filteredData = filteredData.filter(o => o.tables?.nomor_meja.toString() === filterTable);
      }
      setOrders(filteredData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterDate, filterStatus, filterTable]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c19]">Riwayat Transaksi</h1>
        <p className="text-sm text-[#43493c]">Daftar seluruh transaksi yang telah dilakukan</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#eeeee9]">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#43493c] uppercase">Tanggal</label>
          <input
            type="date"
            className="p-2 rounded-lg bg-[#fafaf5] border border-[#eeeee9] text-sm focus:outline-none focus:border-[#385e16]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#43493c] uppercase">No. Meja</label>
          <input
            type="number"
            placeholder="Semua Meja"
            className="p-2 rounded-lg bg-[#fafaf5] border border-[#eeeee9] text-sm focus:outline-none focus:border-[#385e16]"
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#43493c] uppercase">Status</label>
          <select
            className="p-2 rounded-lg bg-[#fafaf5] border border-[#eeeee9] text-sm focus:outline-none focus:border-[#385e16]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="selesai">Selesai</option>
            <option value="baru">Baru</option>
            <option value="diproses">Diproses</option>
            <option value="dibatalkan">Dibatalkan</option>
            <option value="all">Semua Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#eeeee9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fafaf5] border-b border-[#eeeee9]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Meja</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Kasir</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Waktu</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Item</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Pembayaran</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#43493c]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeee9]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#43493c]">Memuat data...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#43493c]">Tidak ada transaksi ditemukan</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-brand-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-black text-ink-primary">Meja {order.tables?.nomor_meja || '0'}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-ink-secondary">
                        {order.kasir_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">
                        {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary max-w-[200px] truncate">
                        {order.order_items?.map(i => `${i.qty}x ${i.nama_menu}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-brand-500">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation(); // Mencegah modal terbuka
                            const newStatus = order.payment_status === 'belum_bayar' ? 'sudah_bayar' : 'belum_bayar';
                            const { error } = await supabase
                              .from('orders')
                              .update({ payment_status: newStatus })
                              .eq('id', order.id);
                            
                            if (!error) {
                              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: newStatus } : o));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                            order.payment_status === 'sudah_bayar'
                              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {order.payment_status === 'sudah_bayar' ? 'Lunas' : 'Tagih'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'baru' ? 'bg-status-baru-bg text-status-baru-text' :
                            order.status === 'diproses' ? 'bg-status-diproses-bg text-status-diproses-text' :
                            'bg-status-selesai-bg text-status-selesai-text'
                          }`}>
                            {order.status}
                          </span>
                          <svg className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
  
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Detail Pesanan - Meja ${selectedOrder?.tables?.nomor_meja}`}
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-[#43493c] font-bold uppercase">Waktu</p>
                  <p className="font-bold">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={selectedOrder.status}>{selectedOrder.status}</Badge>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.payment_status === 'sudah_bayar' 
                      ? 'bg-[#cefda3] text-[#385e16]' 
                      : 'bg-[#ffdad6] text-[#93000a]'
                  }`}>
                    {selectedOrder.payment_status === 'sudah_bayar' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                </div>
              </div>
  
              <div className="space-y-2">
                <p className="text-xs text-[#43493c] font-bold uppercase border-b border-[#eeeee9] pb-1">Daftar Item</p>
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span><span className="font-bold">{item.qty}x</span> {item.nama_menu}</span>
                    <span className="font-mono">{formatRupiah(item.harga_saat_pesan * item.qty)}</span>
                  </div>
                ))}
              </div>
  
              {selectedOrder.catatan && (
                <div className="p-3 bg-[#fafaf5] rounded-lg text-xs italic text-[#43493c]">
                  " {selectedOrder.catatan} "
                </div>
              )}
  
              <div className="pt-4 border-t border-[#eeeee9] flex justify-between items-center">
                <span className="font-bold text-[#1a1c19]">Total Pembayaran</span>
                <span className="text-xl font-mono font-bold text-[#385e16]">{formatRupiah(selectedOrder.total)}</span>
              </div>

              {/* Pratinjau Struk Digital */}
              <div className="pt-8 border-t border-[#eeeee9]">
                <p className="text-center text-xs font-bold text-ink-muted uppercase mb-4 tracking-widest">Pratinjau Struk Fisik</p>
                <div className="bg-surface-muted p-4 rounded-2xl overflow-hidden">
                   <ReceiptPreview order={selectedOrder} />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/print', {
                        method: 'POST',
                        body: JSON.stringify({ order_id: selectedOrder.id }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert('Struk sedang dicetak');
                      } else {
                        alert('Gagal cetak: ' + data.error);
                      }
                    } catch (err) {
                      alert('Gagal cetak: Terjadi kesalahan jaringan');
                    }
                  }}
                  className="w-full py-3 bg-[#1a1c19] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Ulang Struk
                </button>
              </div>
            </div>
          )}
        </Modal>
    </div>
  );
}
