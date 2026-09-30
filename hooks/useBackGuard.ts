'use client';

import { useCallback, useEffect, useRef } from 'react';

type Options = {
  enabled: boolean;
  onBack: () => void;
};

type Result = {
  // Уход со страницы: сначала снимается перехват, потом выполняется переход.
  leave: (go: () => void) => void;
};

// В типах DOM этой версии TypeScript CloseWatcher ещё нет.
type CloseWatcherLike = {
  onclose: (() => void) | null;
  destroy: () => void;
};
type CloseWatcherCtor = new () => CloseWatcherLike;

function closeWatcherCtor(): CloseWatcherCtor | null {
  const ctor = (window as unknown as { CloseWatcher?: CloseWatcherCtor }).CloseWatcher;
  return typeof ctor === 'function' ? ctor : null;
}

// Системный «назад» и Esc во время практики. CloseWatcher получает их событием
// close, не трогая историю и роутер. Наблюдатель после close отработал, поэтому
// создаётся заново. Без CloseWatcher остаётся только Esc.
export function useBackGuard({ enabled, onBack }: Options): Result {
  const onBackRef = useRef(onBack);
  const watcherRef = useRef<CloseWatcherLike | null>(null);
  const leftRef = useRef(false);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!enabled || leftRef.current) return;
    const Ctor = closeWatcherCtor();

    if (!Ctor) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || event.repeat || event.isComposing) return;
        if (!leftRef.current) onBackRef.current();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }

    let active = true;
    let rearm: ReturnType<typeof setTimeout> | null = null;

    const arm = () => {
      if (!active || leftRef.current) return;
      try {
        const watcher = new Ctor();
        watcher.onclose = () => {
          watcherRef.current = null;
          onBackRef.current();
          rearm = setTimeout(arm, 0);
        };
        watcherRef.current = watcher;
      } catch {
        // браузер отказал в наблюдателе — практика идёт без перехвата
      }
    };
    arm();

    return () => {
      active = false;
      if (rearm !== null) clearTimeout(rearm);
      watcherRef.current?.destroy();
      watcherRef.current = null;
    };
  }, [enabled]);

  const leave = useCallback((go: () => void) => {
    leftRef.current = true;
    watcherRef.current?.destroy();
    watcherRef.current = null;
    go();
  }, []);

  return { leave };
}
