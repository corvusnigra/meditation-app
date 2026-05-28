# Микро-осознанность

5-минутный ритуал: box breathing → 5-4-3-2-1 grounding → gratitude anchor.

## Стек

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS 3
- Framer Motion
- localStorage (без бэкенда)
- Web Audio API (генеративный ambient)
- Vibration API (опционально)

## Запуск

```bash
pnpm install
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Билд

```bash
pnpm build
pnpm start
```

## Структура

```
app/                — страницы App Router (home, session/*, complete, history, settings)
components/         — UI компоненты (breathing, grounding, gratitude, history, progression, shared, ui)
context/            — React Context (Settings, History, Progression, Session)
hooks/              — кастомные хуки (useTimer, useBreathingCycle, useBreathingAudio, useHaptics)
lib/                — типы, константы, storage, progression, audio-presets, utils
styles/             — globals.css (Tailwind + keyframes)
public/             — manifest, иконки
```

## Деплой

Vercel: подключите репозиторий, framework определится автоматически.

## Заметки

- Web Audio AudioContext создаётся только после user gesture (тап «Начать»). По умолчанию ambient выключен.
- Прогрессия: 1 (5 мин) → 2 (7 мин) → 3 (10 мин) → 4 (кастом). Пороги: 7 / 14 / 28 дней streak.
- При прерывании streak'а уровень держится ещё 3 дня, затем откатывается на один шаг.
