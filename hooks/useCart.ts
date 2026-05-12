import { useState, useCallback } from 'react';
import { MenuItem } from '@/types';

export interface CartItem extends MenuItem {
  qty: number;
  selectedOptions?: string[];
  uniqueId: string; // menuId + sorted selectedOptions
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');

  const generateUniqueId = (menuId: string, options: string[] = []) => {
    return `${menuId}-${[...options].sort().join('-')}`;
  };

  const addToCart = useCallback((menuItem: MenuItem, options: string[] = []) => {
    const uniqueId = generateUniqueId(menuItem.id, options);
    
    setItems((prev) => {
      const existing = prev.find((item) => item.uniqueId === uniqueId);
      if (existing) {
        return prev.map((item) =>
          item.uniqueId === uniqueId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...menuItem, qty: 1, selectedOptions: options, uniqueId }];
    });
  }, []);

  const removeFromCart = useCallback((uniqueId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.uniqueId === uniqueId);
      if (existing && existing.qty > 1) {
        return prev.map((item) =>
          item.uniqueId === uniqueId ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prev.filter((item) => item.uniqueId !== uniqueId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setNotes('');
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  return {
    items,
    notes,
    setNotes,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };
};
