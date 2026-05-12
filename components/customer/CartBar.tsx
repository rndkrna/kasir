import { formatRupiah } from '@/lib/utils';

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CartBar = ({ totalItems, totalPrice, notes, onNotesChange, onSubmit, isSubmitting }: CartBarProps) => {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-white border-t border-surface-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-4 md:px-6 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        {/* Notes Input */}
        <div className="flex-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Catatan pesanan..."
            className="w-full bg-surface-soft border border-surface-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-6 md:min-w-[400px]">
          <div className="flex flex-col">
            <span className="text-[10px] text-ink-secondary uppercase font-bold tracking-widest">Total Pesanan ({totalItems})</span>
            <span className="text-xl font-bold font-mono text-ink-primary">{formatRupiah(totalPrice)}</span>
          </div>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 md:flex-none md:w-48 bg-brand-500 hover:bg-brand-600 text-ink-inverse h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-ink-inverse border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Kirim Pesanan
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
