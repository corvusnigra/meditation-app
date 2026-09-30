'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { TONE, type Tone } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

type Props = {
  // Целевой размер ядра: 1 — полный вдох.
  scale: number;
  durationSec: number;
  tone?: Tone;
  // Уменьшенное движение: размер не меняется, фазу показывает прозрачность.
  still?: boolean;
  paused?: boolean;
  phase?: string;
};

export const CIRCLE_REST_SCALE = 0.55;
const STILL_SCALE = 0.85;
const EASE = [0.4, 0, 0.2, 1] as const;

// Ореол в 1,45 раза шире ядра. Блок занимает место под ореол на пике вдоха,
// поэтому круг не выходит за экран и не наезжает на подпись под ним:
// 290 px при ширине 375, 260 px при 320.
const BOX = 'calc(min(200px, 56vw) * 1.45)';
const RING = 'absolute rounded-full';

export function PracticeCircle({
  scale,
  durationSec,
  tone = 'breathing',
  still = false,
  paused = false,
  phase,
}: Props) {
  const value = useMotionValue(still ? STILL_SCALE : CIRCLE_REST_SCALE);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const pausedRef = useRef(false);
  const color = TONE[tone];

  useEffect(() => {
    if (still) {
      value.set(STILL_SCALE);
      return;
    }
    const controls = animate(value, scale, { duration: durationSec, ease: EASE });
    controlsRef.current = controls;
    return () => {
      controls.stop();
      controlsRef.current = null;
    };
  }, [value, scale, durationSec, still]);

  // Пауза замораживает круг на месте; после неё он доходит оставшийся путь.
  // play() зовётся только после pause(): на завершённой анимации он бы
  // запустил её заново.
  useEffect(() => {
    if (paused) {
      controlsRef.current?.pause();
      pausedRef.current = true;
    } else if (pausedRef.current) {
      controlsRef.current?.play();
      pausedRef.current = false;
    }
  }, [paused]);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: BOX, height: BOX }}
      data-breath-phase={phase}
      aria-hidden
    >
      <motion.div
        className={cn(RING, 'inset-0 opacity-60', color.soft)}
        style={{ scale: value }}
      />
      <motion.div
        className={cn(RING, color.soft)}
        style={{ scale: value, width: '82.76%', height: '82.76%' }}
      />
      <motion.div
        className={cn(
          RING,
          'transition-opacity duration-500',
          color.circle,
          color.glow,
          still && scale < 0.75 && 'opacity-50',
        )}
        style={{ scale: value, width: '68.97%', height: '68.97%' }}
      />
    </div>
  );
}
