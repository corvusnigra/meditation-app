'use client';

import { useState } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { Button } from '@/components/ui/Button';
import { clearAllStorage } from '@/lib/storage';

// Экран показывается, когда что-то уже упало — возможно, сами провайдеры.
// Поэтому контексты приложения здесь не используются.
export function ErrorScreen() {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const reload = () => window.location.reload();

  const resetData = () => {
    try {
      clearAllStorage();
    } catch {
      // хранилище недоступно — перезагрузка всё равно нужна
    }
    reload();
  };

  return (
    <PageShell>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-10">
        <div
          aria-hidden
          className="w-20 h-20 rounded-full bg-accent-streak/15 border border-accent-streak/40 flex items-center justify-center text-3xl text-accent-streak"
        >
          !
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-medium text-balance">Что-то пошло не так</h1>
          <p className="text-text-secondary max-w-xs text-balance">
            Попробуйте перезагрузить приложение. Если ошибка повторяется, поможет
            сброс данных.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button size="lg" onClick={reload}>
            Перезагрузить
          </Button>
          {confirmingReset ? (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary max-w-xs">
                Удалит все сессии, настройки и уровень. Действие необратимо.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="danger" size="sm" onClick={resetData}>
                  Да, удалить
                </Button>
                <Button
                  variant="pill"
                  size="sm"
                  onClick={() => setConfirmingReset(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingReset(true)}
            >
              Сбросить данные
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
