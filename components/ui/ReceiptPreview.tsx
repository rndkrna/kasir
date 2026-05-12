'use client';

import { Order } from '@/types';
import { formatRupiah } from '@/lib/utils';

interface ReceiptPreviewProps {
  order: Order;
}

export function ReceiptPreview({ order }: ReceiptPreviewProps) {
  return (
    <div className="bg-white p-8 shadow-inner border border-gray-200 mx-auto max-w-[350px] font-mono text-[13px] text-gray-800 leading-tight">
      {/* Header */}
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-bold tracking-tighter text-black">ARTISAN BREWS</h2>
        <p className="text-[10px] uppercase">Forest Green Coffee & Roastery</p>
        <p className="text-[10px]">Jl. Kopi Harapan No. 12, Jakarta</p>
        <p className="text-[10px]">Telp: 0812-3456-7890</p>
      </div>

      <div className="border-b border-dashed border-gray-400 my-4"></div>

      {/* Order Info */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Waktu</span>
          <span>{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Meja</span>
          <span>{order.tables?.nomor_meja || 'Kasir'}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>{order.kasir_name || '-'}</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>ID</span>
          <span>#{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-400 my-4"></div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.order_items?.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="font-bold text-black uppercase">{item.nama_menu}</div>
            <div className="flex justify-between">
              <span>{item.qty} x {formatRupiah(item.harga_saat_pesan)}</span>
              <span>{formatRupiah(item.harga_saat_pesan * item.qty)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-gray-400 my-4"></div>

      {/* Total */}
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-bold text-black">
          <span>TOTAL</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>Rp 0</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-400 my-4"></div>

      {/* Footer */}
      <div className="text-center space-y-1 mt-6">
        <p className="font-bold">TERIMA KASIH</p>
        <p className="text-[10px]">Silakan berkunjung kembali</p>
        <div className="mt-4 opacity-30 text-[8px] italic">
          Powerd by Artisan POS
        </div>
      </div>

      {/* Paper Effect */}
      <div className="relative mt-8 h-2">
        <div className="absolute inset-x-0 top-0 flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-50 rotate-45 transform origin-top-left border-l border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
