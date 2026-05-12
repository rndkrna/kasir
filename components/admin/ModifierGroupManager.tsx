'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ModifierGroup } from '@/types';
import { ModifierOptionList } from './ModifierOptionList';
import { Button } from '@/components/ui/Button';

export const ModifierGroupManager = () => {
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ nama: '', tipe: 'single' as 'single' | 'multiple', is_required: true });
  
  const supabase = createClient();

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modifier_groups')
      .select('*, modifier_options(*)')
      .order('urutan', { ascending: true });

    if (error) {
      alert('Gagal mengambil data modifier: ' + error.message);
    } else if (data) {
      setGroups(data as unknown as ModifierGroup[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('modifier_groups')
      .insert({
        ...newGroup,
        urutan: groups.length + 1
      });

    if (!error) {
      setNewGroup({ nama: '', tipe: 'single', is_required: true });
      setShowAddForm(false);
      fetchGroups();
    } else {
      alert('Gagal menambah grup: ' + error.message);
    }
  };

  const updateGroupOrder = async (id: string, newOrder: number) => {
    await supabase
      .from('modifier_groups')
      .update({ urutan: newOrder })
      .eq('id', id);
    fetchGroups();
  };

  const handleDeleteGroup = async (groupId: string) => {
    // Check if group is linked to any menu
    const { data: linkedMenus } = await supabase
      .from('menu_modifier_groups')
      .select('menu_id')
      .eq('group_id', groupId)
      .limit(1);

    if (linkedMenus && linkedMenus.length > 0) {
      alert('DILARANG: Grup modifier ini masih terhubung ke menu aktif. Putuskan hubungan di manajemen menu terlebih dahulu.');
      return;
    }

    if (confirm('Hapus grup modifier ini beserta seluruh opsinya?')) {
      const { error } = await supabase.from('modifier_groups').delete().eq('id', groupId);
      if (!error) fetchGroups();
      else alert('Gagal menghapus: ' + error.message);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-ink-primary uppercase tracking-wider">Manajemen Modifier</h2>
          <p className="text-xs text-ink-secondary mt-1">Atur pilihan tambahan untuk menu (Beans, Ukuran, dll.)</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" variant={showAddForm ? 'ghost' : 'primary'}>
          {showAddForm ? 'Batal' : '+ Tambah Grup'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGroup} className="p-6 bg-brand-50/50 border border-brand-100 rounded-3xl space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-ink-muted px-1">Nama Grup</label>
              <input
                type="text"
                placeholder="Contoh: Pilihan Beans"
                value={newGroup.nama}
                onChange={(e) => setNewGroup({ ...newGroup, nama: e.target.value })}
                className="h-11 px-4 bg-white border border-surface-border rounded-xl text-sm outline-none focus:border-brand-500 transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-ink-muted px-1">Tipe Seleksi</label>
              <select
                value={newGroup.tipe}
                onChange={(e) => setNewGroup({ ...newGroup, tipe: e.target.value as 'single' | 'multiple' })}
                className="h-11 px-4 bg-white border border-surface-border rounded-xl text-sm outline-none focus:border-brand-500 transition-all appearance-none"
              >
                <option value="single">Single (Pilih Satu)</option>
                <option value="multiple">Multiple (Boleh Banyak)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-ink-muted px-1">Kewajiban</label>
              <select
                value={String(newGroup.is_required)}
                onChange={(e) => setNewGroup({ ...newGroup, is_required: e.target.value === 'true' })}
                className="h-11 px-4 bg-white border border-surface-border rounded-xl text-sm outline-none focus:border-brand-500 transition-all appearance-none"
              >
                <option value="true">Wajib (Required)</option>
                <option value="false">Opsional</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm">Simpan Grup</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white border border-surface-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-surface-border bg-surface-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={group.urutan}
                  onChange={(e) => updateGroupOrder(group.id, parseInt(e.target.value) || 0)}
                  className="w-12 h-9 text-center font-black bg-white border border-surface-border rounded-xl outline-none focus:border-brand-500 shadow-sm"
                />
                <div>
                  <h3 className="font-black text-ink-primary leading-tight">{group.nama}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-md">
                      {group.tipe}
                    </span>
                    {group.is_required && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">
                        Wajib
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteGroup(group.id)}
                className="p-2 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 flex-1 bg-surface-white">
              <ModifierOptionList 
                groupId={group.id} 
                options={group.modifier_options || []} 
                onUpdate={fetchGroups} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
