'use client';

import { useEffect, useState } from 'react';
import { isoDayKey } from '@/lib/utils';

// Ключ текущего дня. Приложение может сутками висеть в памяти телефона,
// поэтому при возврате из фона «сегодня» сверяется заново.
export function useDayKey(): string {
  const [dayKey, setDayKey] = useState(() => isoDayKey(new Date()));

  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === 'visible') {
        setDayKey(isoDayKey(new Date()));
      }
    };
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return dayKey;
}
