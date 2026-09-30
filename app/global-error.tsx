'use client';

import '../styles/globals.css';
import { ErrorScreen } from '@/components/shared/ErrorScreen';

// Падение в корневом layout и его провайдерах (они читают localStorage)
// ловит только этот файл. Он заменяет layout целиком, вместе с его метатегами
// и шрифтом Inter — отсюда свои html, head и body, а шрифт задан системный,
// иначе браузер подставит шрифт с засечками.
export default function GlobalError() {
  return (
    <html lang="ru" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ErrorScreen />
      </body>
    </html>
  );
}
