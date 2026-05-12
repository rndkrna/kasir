import { useState, useEffect, useCallback } from 'react';
import { playNotificationSound } from '@/lib/audio';

const LOCAL_STORAGE_KEY = 'kafe-pos-sound-enabled';

export const useSound = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.8);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    }
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(LOCAL_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const play = useCallback(() => {
    if (isEnabled) {
      playNotificationSound(volume);
    }
  }, [isEnabled, volume]);

  return {
    isEnabled,
    volume,
    setVolume,
    toggle,
    play,
  };
};
