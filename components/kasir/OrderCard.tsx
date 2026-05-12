import { useState } from 'react';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, status: Order['status']) => void;
}

export const OrderCard = ({ order, onUpdateStatus }: OrderCardProps) => {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const supabase = createClient();
  
  const createdDate = new Date(order.created_at);
  const timeAgo = () => {
    const diff = Math.floor((new Date().getTime() - createdDate.getTime()) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} mnt lalu`;
    return `${Math.floor(diff / 60)} jam lalu`;
  };

  const togglePaymentStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdatingPayment(true);
    const newPaymentStatus = order.payment_status === 'belum_bayar' ? 'sudah_bayar' : 'belum_bayar';
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus })
      .eq('id', order.id);

    if (error) alert('Gagal update pembayaran: ' + error.message);
    setIsUpdatingPayment(false);
  };

  return (
    <div className="bg-surface-white rounded-xl border border-surface-border shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-200">
      {/* Header: ID & Status */}
      <div className="p-4 pb-3 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-ink-primary font-mono tracking-tighter">#{order.id.slice(-4).toUpperCase()}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
              order.status === 'baru' ? 'bg-status-baru-bg text-status-baru-text' :
              order.status === 'diproses' ? 'bg-status-diproses-bg text-status-diproses-text' :
              'bg-status-selesai-bg text-status-selesai-text'
            }`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-secondary text-xs">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             <span className="font-semibold">Meja {order.tables?.nomor_meja || '0'}</span>
          </div>
        </div>
        <div className="text-right">
            <div className="flex items-center gap-1 text-ink-muted text-[10px] font-bold uppercase mb-1 tracking-tighter">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {timeAgo()}
            </div>
            <p className="text-sm font-mono font-bold text-ink-primary">{formatRupiah(order.total)}</p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-surface-border flex-1 space-y-3">
        <div className="space-y-2.5">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm leading-tight">
              <div className="flex-1">
                <p className="text-ink-primary">
                  <span className="font-bold text-brand-500 mr-1.5">{item.qty}x</span> 
                  <span className="font-medium">{item.nama_menu}</span>
                </p>
              </div>
              <span className="font-mono text-xs text-ink-secondary ml-4">{formatRupiah(item.harga_saat_pesan * item.qty)}</span>
            </div>
          ))}
        </div>

        {order.catatan && (
          <div className="p-2.5 bg-surface-soft rounded-lg text-[11px] text-ink-secondary border-l-2 border-brand-500">
            <span className="font-bold block mb-0.5 opacity-60 text-[9px] uppercase tracking-wider">Catatan:</span>
            <span className="italic">"{order.catatan}"</span>
          </div>
        )}
      </div>

      <div className="p-4 pt-2 space-y-3">
        {/* Payment Status Toggle */}
        <div className="flex justify-between items-center px-1">
           <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Pembayaran</span>
           <button 
              onClick={togglePaymentStatus}
              disabled={isUpdatingPayment}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-150 active:scale-95 ${
                order.payment_status === 'sudah_bayar' 
                  ? 'bg-brand-500 text-ink-inverse' 
                  : 'bg-surface-soft text-ink-secondary border border-surface-border hover:bg-surface-muted'
              }`}
            >
              {isUpdatingPayment ? '...' : order.payment_status === 'sudah_bayar' ? 'Lunas' : 'Tagih'}
            </button>
        </div>

        {order.status !== 'selesai' && (
          <button
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              const cashierName = user?.user_metadata?.full_name || user?.email || 'Staff';
              
              await supabase
                .from('orders')
                .update({ kasir_name: cashierName })
                .eq('id', order.id);

              onUpdateStatus(order.id, order.status === 'baru' ? 'diproses' : 'selesai');
            }}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-ink-inverse rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/10 active:scale-[0.97]"
          >
            {order.status === 'baru' ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Proses Pesanan
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Tandai Selesai
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
