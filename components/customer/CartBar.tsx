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
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="max-w-md mx-auto bg-brand-700/90 backdrop-blur-lg rounded-2xl p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border border-white/10">
        {/* Notes Input */}
        <div className="mb-4">
          <input
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Tambah catatan (opsional)..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-black shadow-inner">
              {totalItems}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Total</span>
              <span className="text-xl font-mono font-black text-white">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-brand-100 hover:bg-white text-brand-700 h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-black/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Kirim
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
