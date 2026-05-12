import { MenuItem } from '@/types';
import { formatRupiah } from '@/lib/utils';
import Image from 'next/image';

interface MenuCardProps {
  item: MenuItem;
  qty: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
}

export const MenuCard = ({ item, qty, onAdd, onRemove }: MenuCardProps) => {
  return (
    <div className="bg-surface-white rounded-2xl border border-surface-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={item.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Availability Badge */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-ink-primary/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-ink-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Habis</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-ink-primary leading-snug mb-1 line-clamp-2">
          {item.nama}
        </h3>
        <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed mb-3 flex-1">
          {item.deskripsi || 'Sajian spesial racikan tangan barista kami.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-mono font-bold text-brand-500">
            {formatRupiah(item.harga)}
          </span>

          {qty > 0 ? (
            <div className="flex items-center bg-brand-500 text-white rounded-full p-1 shadow-md shadow-brand-500/20">
              <button
                onClick={() => onRemove(item.id)}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <span className="w-6 text-center text-xs font-bold">{qty}</span>
              <button
                onClick={() => onAdd(item)}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              disabled={!item.is_available}
              className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:bg-ink-muted text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/20 transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
