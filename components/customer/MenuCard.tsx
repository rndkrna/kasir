import { MenuItem } from '@/types';
import { formatRupiah } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  qty: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
}

export const MenuCard = ({ item, qty, onAdd, onRemove }: MenuCardProps) => {
  return (
    <div className="flex items-center gap-3 bg-surface-white border border-surface-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-150 group">
      {/* Image Section */}
      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-surface-muted rounded-lg">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={item.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {!item.is_available && (
          <div className="absolute inset-0 bg-status-habis-bg/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[8px] font-bold text-status-habis-text uppercase tracking-tighter">Habis</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-ink-primary truncate">
          {item.nama}
        </h3>
        <p className="text-xs text-ink-secondary line-clamp-2 mt-0.5 leading-tight">
          {item.deskripsi || 'Sajian spesial racikan tangan barista kami.'}
        </p>
        <p className="text-sm font-semibold font-mono text-ink-primary mt-1">
          {formatRupiah(item.harga)}
        </p>
      </div>

      {/* Qty Control Section */}
      <div className="flex flex-col items-center gap-1.5">
        {qty > 0 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 rounded-full border border-surface-border bg-surface-muted hover:bg-surface-border flex items-center justify-center text-ink-primary transition-colors"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="text-sm font-semibold text-ink-primary w-5 text-center">{qty}</span>
            <button
              onClick={() => onAdd(item)}
              className="w-7 h-7 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-ink-inverse transition-colors"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            disabled={!item.is_available}
            className="w-8 h-8 bg-brand-500 hover:bg-brand-600 disabled:bg-ink-muted text-ink-inverse rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
