'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ModifierOption } from '@/types';
import { formatRupiah } from '@/lib/utils';

interface ModifierOptionListProps {
  groupId: string;
  options: ModifierOption[];
  onUpdate: () => void;
}

export const ModifierOptionList = ({ groupId, options, onUpdate }: ModifierOptionListProps) => {
  const [newOptionName, setNewOptionName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionName.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('modifier_options')
      .insert({
        group_id: groupId,
        nama: newOptionName,
        urutan: options.length + 1
      });

    if (!error) {
      setNewOptionName('');
      onUpdate();
    } else {
      alert('Gagal menambah opsi: ' + error.message);
    }
    setLoading(false);
  };

  const toggleOption = async (optionId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('modifier_options')
      .update({ is_available: !currentValue })
      .eq('id', optionId);

    if (!error) {
      onUpdate();
    }
  };

  const updateOrder = async (optionId: string, newOrder: number) => {
    await supabase
      .from('modifier_options')
      .update({ urutan: newOrder })
      .eq('id', optionId);
    onUpdate();
  };

  const deleteOption = async (optionId: string) => {
    if (confirm('Hapus opsi ini?')) {
      await supabase.from('modifier_options').delete().eq('id', optionId);
      onUpdate();
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {options.sort((a, b) => a.urutan - b.urutan).map((opt) => (
          <div key={opt.id} className="flex items-center justify-between p-3 bg-surface-white border border-surface-border rounded-xl group hover:border-brand-200 transition-all">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={opt.urutan}
                onChange={(e) => updateOrder(opt.id, parseInt(e.target.value) || 0)}
                className="w-10 h-8 text-center text-xs font-bold bg-surface-soft border border-surface-border rounded-lg outline-none focus:border-brand-500"
              />
              <span className={`text-sm font-bold ${opt.is_available ? 'text-ink-primary' : 'text-ink-muted line-through'}`}>
                {opt.nama}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleOption(opt.id, opt.is_available)}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${
                  opt.is_available 
                    ? 'bg-status-selesai-bg text-status-selesai-text border border-status-selesai-border' 
                    : 'bg-status-habis-bg text-status-habis-text border border-status-habis-border'
                }`}
              >
                {opt.is_available ? 'Tersedia' : 'Habis'}
              </button>
              
              <button 
                onClick={() => deleteOption(opt.id)}
                className="p-1.5 text-ink-muted hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddOption} className="flex gap-2">
        <input
          type="text"
          placeholder="Tambah opsi baru..."
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          className="flex-1 h-10 px-4 bg-surface-soft border border-surface-border rounded-xl text-sm outline-none focus:border-brand-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !newOptionName.trim()}
          className="h-10 px-4 bg-ink-primary text-white rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 transition-all"
        >
          Tambah
        </button>
      </form>
    </div>
  );
};
