'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, ModifierGroup } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MenuItemFormProps {
  item?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MenuItemForm = ({ item, onSuccess, onCancel }: MenuItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    nama: item?.nama || '',
    deskripsi: item?.deskripsi || '',
    harga: item?.harga || 0,
    kategori: item?.kategori || 'kopi',
    urutan: item?.urutan || 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [allGroups, setAllGroups] = useState<ModifierGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all available modifier groups
      const { data: groups } = await supabase
        .from('modifier_groups')
        .select('*')
        .order('urutan', { ascending: true });
      
      if (groups) setAllGroups(groups as ModifierGroup[]);

      // If editing, fetch currently linked groups
      if (item?.id) {
        const { data: linked } = await supabase
          .from('menu_modifier_groups')
          .select('group_id')
          .eq('menu_id', item.id);
        
        if (linked) {
          setSelectedGroups(linked.map(l => l.group_id));
        }
      }
    };

    fetchData();
  }, [item?.id, supabase]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let foto_url = item?.foto_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);
        
        foto_url = urlData.publicUrl;
      }

      let menuId = item?.id;

      if (item?.id) {
        const { error } = await supabase
          .from('menus')
          .update({ ...formData, foto_url })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { data: newMenu, error } = await supabase
          .from('menus')
          .insert({ ...formData, foto_url })
          .select()
          .single();
        if (error) throw error;
        menuId = newMenu.id;
      }

      // Update modifier relationships
      if (menuId) {
        // First delete existing relations
        await supabase
          .from('menu_modifier_groups')
          .delete()
          .eq('menu_id', menuId);
        
        // Insert new ones
        if (selectedGroups.length > 0) {
          const relations = selectedGroups.map(groupId => ({
            menu_id: menuId,
            group_id: groupId
          }));
          await supabase.from('menu_modifier_groups').insert(relations);
        }
      }

      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      alert('Gagal menyimpan menu: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-ink-muted tracking-widest px-1">Informasi Dasar</h4>
        <Input
          label="Nama Menu"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          required
        />
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-primary">Deskripsi</label>
          <textarea
            className="p-3 rounded-xl bg-surface-soft border border-surface-border text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-h-[80px] transition-all text-sm"
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Harga (Rp)"
            type="number"
            value={formData.harga}
            onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-primary">Kategori</label>
            <select
              className="h-12 px-4 rounded-xl bg-surface-soft border border-surface-border text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none text-sm"
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value as MenuItem['kategori'] })}
            >
              <option value="kopi">Kopi</option>
              <option value="non-kopi">Non-Kopi</option>
              <option value="makanan">Makanan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <Input
          label="Urutan Tampil"
          type="number"
          value={formData.urutan}
          onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-primary">Foto Menu</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-ink-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-all cursor-pointer bg-surface-soft p-2 rounded-xl border border-dashed border-surface-border"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-surface-border">
        <h4 className="text-[10px] font-black uppercase text-ink-muted tracking-widest px-1">Modifier yang Tersedia</h4>
        {allGroups.length === 0 ? (
          <p className="text-xs text-ink-muted italic px-1">Belum ada grup modifier yang dibuat.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {allGroups.map(group => (
              <label 
                key={group.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedGroups.includes(group.id) 
                    ? 'bg-brand-50 border-brand-200' 
                    : 'bg-white border-surface-border hover:border-brand-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="w-4 h-4 rounded-md border-surface-border text-brand-500 focus:ring-brand-500"
                />
                <span className={`text-xs font-bold ${selectedGroups.includes(group.id) ? 'text-brand-600' : 'text-ink-primary'}`}>
                  {group.nama}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          className="bg-brand-500 hover:bg-brand-600 text-ink-inverse"
        >
          Simpan Produk
        </Button>
      </div>
    </form>
  );
};
