'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem } from '@/types';
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

      if (item?.id) {
        const { error } = await supabase
          .from('menus')
          .update({ ...formData, foto_url })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menus')
          .insert({ ...formData, foto_url });
        if (error) throw error;
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Menu"
        value={formData.nama}
        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
        required
      />
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-primary">Deskripsi</label>
        <textarea
          className="p-3 rounded-lg bg-surface-soft border border-surface-border text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-h-[100px] transition-all"
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Harga (Rp)"
          type="number"
          value={formData.harga}
          onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) })}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink-primary">Kategori</label>
          <select
            className="h-12 px-4 rounded-lg bg-surface-soft border border-surface-border text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
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
        onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-primary">Foto Menu</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-ink-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100 transition-all cursor-pointer"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          className="bg-brand-500 hover:bg-brand-600 text-ink-inverse"
        >
          Simpan
        </Button>
      </div>
    </form>
  );
};
