'use client';

import { useState, useMemo } from 'react';
import { MenuItem, ModifierGroup as ModifierGroupType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/utils';
import { ModifierGroup } from './ModifierGroup';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedOptions: string[]) => void;
}

export const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }: MenuItemModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const isComplete = useMemo(() => {
    if (!item) return false;
    // Check if all required groups have at least one selection
    // A group is only 'effectively' required if it has available options
    const requiredGroups = item.modifier_groups?.filter(g => 
      g.is_required && (g.modifier_options?.some(o => o.is_available) ?? false)
    ) || [];
    
    return requiredGroups.every(group => {
      const groupOptions = group.modifier_options?.map(o => o.id) || [];
      return selectedOptions.some(id => groupOptions.includes(id));
    });
  }, [item, selectedOptions]);

  if (!item) return null;

  const handleToggleOption = (groupId: string, optionId: string, tipe: 'single' | 'multiple') => {
    setSelectedOptions((prev) => {
      // Find current options belonging to this group
      const groupOptions = item.modifier_groups?.find(g => g.id === groupId)?.modifier_options?.map(o => o.id) || [];
      
      if (tipe === 'single') {
        // Remove other options from same group, add new one
        return [...prev.filter(id => !groupOptions.includes(id)), optionId];
      } else {
        // Toggle the option
        return prev.includes(optionId) 
          ? prev.filter(id => id !== optionId) 
          : [...prev, optionId];
      }
    });
  };

  const handleAdd = () => {
    if (isComplete) {
      onAddToCart(item, selectedOptions);
      setSelectedOptions([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Menu">
      <div className="space-y-8">
        {/* Top Info */}
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-muted flex-shrink-0 border border-surface-border/50 shadow-sm">
            {item.foto_url ? (
              <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-black text-ink-primary leading-tight tracking-tight">{item.nama}</h3>
            <p className="text-lg font-bold font-mono text-brand-600 mt-1">{formatRupiah(item.harga)}</p>
          </div>
        </div>

        {/* Description */}
        {item.deskripsi && (
          <div className="bg-surface-soft p-4 rounded-2xl border border-surface-border/50">
            <p className="text-sm text-ink-secondary leading-relaxed italic">"{item.deskripsi}"</p>
          </div>
        )}

        {/* Modifiers List */}
        <div className="space-y-10">
          {item.modifier_groups?.map((group) => (
            <ModifierGroup
              key={group.id}
              group={group}
              selectedOptions={selectedOptions}
              onToggle={(optionId) => handleToggleOption(group.id, optionId, group.tipe)}
            />
          ))}
        </div>

        {/* Footer Action */}
        <div className="pt-6 border-t border-surface-border">
          <button
            onClick={handleAdd}
            disabled={!isComplete}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:grayscale text-ink-inverse rounded-2xl font-black text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            Tambahkan ke Keranjang
          </button>
          {!isComplete && (
             <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-widest mt-3">Silakan lengkapi pilihan wajib (*)</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
