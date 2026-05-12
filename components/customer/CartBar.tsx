import { formatRupiah } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CartBar = ({ totalItems, totalPrice, notes, onNotesChange, onSubmit, isSubmitting }: CartBarProps) => {
  const pathname = usePathname();
  const isCustomer = pathname?.includes('/menu');
  
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-white border-t border-surface-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 z-50">
      <div className={`${isCustomer ? 'max-w-md' : 'max-w-6xl'} mx-auto space-y-3`}>
        {/* Notes Input - Always on top for mobile/customer layout */}
        <div className="w-full">
          <input
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Catatan pesanan..."
            className="w-full bg-surface-soft border border-surface-border rounded-lg px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-ink-secondary uppercase font-bold tracking-widest">Total Pesanan ({totalItems})</span>
            <span className="text-xl font-bold font-mono text-ink-primary leading-none mt-0.5">{formatRupiah(totalPrice)}</span>
          </div>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 max-w-[160px] bg-brand-500 hover:bg-brand-600 text-ink-inverse h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-brand-500/10"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-ink-inverse border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isCustomer ? 'Kirim Pesanan' : 'Bayar Sekarang'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
