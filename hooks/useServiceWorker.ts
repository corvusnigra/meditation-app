'use client';

import { useEffect } from 'react';

// Service worker держит приложение в кэше: после первого открытия оно
// запускается без сети и там, где vercel.app недоступен.
export function useServiceWorker(): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // без сети первая регистрация не проходит — повторим при следующем запуске
    });
  }, []);
}
