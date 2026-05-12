import { useState, useCallback } from 'react';
import { MenuItem } from '@/types';

export interface CartItem extends MenuItem {
  qty: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');

  const addToCart = useCallback((menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...menuItem, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((menuId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === menuId);
      if (existing && existing.qty > 1) {
        return prev.map((item) =>
          item.id === menuId ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== menuId);
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
