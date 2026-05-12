import { formatRupiah } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  paymentAmount?: number;
  onPaymentAmountChange?: (amount: number) => void;
}

export const CartBar = ({ 
  totalItems, 
  totalPrice, 
  notes, 
  onNotesChange, 
  onSubmit, 
  isSubmitting,
  paymentAmount,
  onPaymentAmountChange
}: CartBarProps) => {
  const pathname = usePathname();
  const isCustomer = pathname?.includes('/menu');
  
  if (totalItems === 0) return null;

  const change = (paymentAmount || 0) - totalPrice;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border shadow-[0_-8px_30px_rgba(0,0,0,0.04)] p-4 z-50">
      <div className={`${isCustomer ? 'max-w-md' : 'max-w-6xl'} mx-auto flex flex-col gap-4`}>
        <div className="flex items-center gap-4">
          {/* Notes Input - Flex-1 to take available space */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Catatan pesanan..."
              className="w-full bg-surface-soft border border-surface-border rounded-xl px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          {!isCustomer && onPaymentAmountChange && (
            <div className="w-48">
              <input
                type="number"
                value={paymentAmount || ''}
                onChange={(e) => onPaymentAmountChange(parseInt(e.target.value) || 0)}
                placeholder="Nominal Bayar (Rp)"
                className="w-full bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm font-bold text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Total Price Section */}
          <div className="flex flex-col items-end min-w-fit">
            <span className="text-[9px] text-ink-secondary uppercase font-bold tracking-widest whitespace-nowrap">Total ({totalItems})</span>
            <span className="text-base font-bold font-mono text-ink-primary leading-tight">{formatRupiah(totalPrice)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || (!isCustomer && (paymentAmount || 0) < totalPrice)}
            className="bg-brand-500 hover:bg-brand-600 text-ink-inverse px-6 h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-500/10 whitespace-nowrap"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-ink-inverse border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">{isCustomer ? 'Kirim Pesanan' : 'Bayar'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {!isCustomer && paymentAmount !== undefined && paymentAmount >= totalPrice && (
          <div className="flex justify-end gap-2 items-center text-xs">
            <span className="text-ink-secondary font-bold uppercase tracking-widest text-[9px]">Kembalian:</span>
            <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
              {formatRupiah(change)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
