'use client';

import { ModifierGroup as ModifierGroupType, ModifierOption } from '@/types';

interface ModifierGroupProps {
  group: ModifierGroupType;
  selectedOptions: string[];
  onToggle: (optionId: string) => void;
}

export const ModifierGroup = ({ group, selectedOptions, onToggle }: ModifierGroupProps) => {
  // Filter only available options
  const availableOptions = group.modifier_options?.filter(o => o.is_available) || [];
  
  if (availableOptions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <h4 className="text-xs font-black text-ink-primary uppercase tracking-widest">
          {group.nama}
          {group.is_required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-tight">
          {group.tipe === 'single' ? 'Pilih satu' : 'Boleh pilih banyak'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {availableOptions.sort((a, b) => a.urutan - b.urutan).map((option) => (
          <label
            key={option.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
              selectedOptions.includes(option.id)
                ? 'bg-brand-50 border-brand-500 shadow-sm'
                : 'bg-white border-surface-border hover:border-brand-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedOptions.includes(option.id)
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-surface-border bg-white'
              }`}>
                {selectedOptions.includes(option.id) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className={`text-sm font-bold ${selectedOptions.includes(option.id) ? 'text-brand-600' : 'text-ink-primary'}`}>
                {option.nama}
              </span>
            </div>
            
            <input
              type={group.tipe === 'single' ? 'radio' : 'checkbox'}
              className="hidden"
              checked={selectedOptions.includes(option.id)}
              onChange={() => onToggle(option.id)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};
