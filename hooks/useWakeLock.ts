'use client';

import { useEffect } from 'react';

// Держит экран включённым на время активной сессии.
// Без этого телефон гаснет на 2-й минуте, а вибро-гид
// перестаёт работать (Chrome игнорирует vibrate() от скрытых страниц).
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release();
        } else {
          lock = sentinel;
        }
      } catch {
        // отказ системы (низкий заряд и т.п.) — работаем без блокировки
      }
    };

    // ОС сама снимает lock, когда вкладка уходит в фон — возвращаем при показе.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void request();
      }
    };

    void request();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      lock?.release().catch(() => {});
      lock = null;
    };
  }, [active]);
}
