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
    <div className="flex items-center gap-4 bg-surface-white border border-surface-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-surface-muted rounded-lg border border-surface-border/50">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={item.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <svg className="w-8 h-8 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {!item.is_available && (
          <div className="absolute inset-0 bg-status-habis-bg/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-bold text-status-habis-text uppercase tracking-widest">Habis</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-ink-primary leading-tight">
          {item.nama}
        </h3>
        <p className="text-xs text-ink-secondary line-clamp-2 mt-1 leading-snug">
          {item.deskripsi || 'Sajian spesial racikan tangan barista kami.'}
        </p>
        <p className="text-sm font-bold font-mono text-ink-primary mt-2">
          {formatRupiah(item.harga)}
        </p>
      </div>

      {/* Qty Control Section */}
      <div className="flex flex-col items-center gap-2">
        {qty > 0 ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 rounded-full border border-surface-border bg-surface-white hover:bg-surface-soft flex items-center justify-center text-ink-primary transition-all active:scale-90"
            >
              <span className="text-xl leading-none font-light">−</span>
            </button>
            <span className="text-sm font-bold text-ink-primary w-4 text-center">{qty}</span>
            <button
              onClick={() => onAdd(item)}
              className="w-8 h-8 rounded-full border border-surface-border bg-surface-white hover:bg-surface-soft flex items-center justify-center text-ink-primary transition-all active:scale-90"
            >
              <span className="text-xl leading-none font-light">+</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            disabled={!item.is_available}
            className="w-9 h-9 border border-surface-border bg-surface-white hover:bg-surface-soft disabled:opacity-30 text-ink-primary rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
