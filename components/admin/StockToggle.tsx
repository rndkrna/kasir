'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StockToggleProps {
  itemId: string;
  initialValue: boolean;
  onUpdate?: (newValue: boolean) => void;
}

export const StockToggle = ({ itemId, initialValue, onUpdate }: StockToggleProps) => {
  const [isActive, setIsActive] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async () => {
    setLoading(true);
    const newValue = !isActive;
    
    const { error } = await supabase
      .from('menus')
      .update({ is_available: newValue })
      .eq('id', itemId);

    if (!error) {
      setIsActive(newValue);
      if (onUpdate) onUpdate(newValue);
    } else {
      alert('Gagal memperbarui stok: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isActive ? 'bg-[#385e16]' : 'bg-[#dadad6]'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`${
          isActive ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
};
