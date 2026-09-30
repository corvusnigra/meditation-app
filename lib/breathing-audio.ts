'use client';

import { AMBIENT_PRESETS } from './audio-presets';
import type { AmbientPreset, BreathingPhase } from './types';

type Graph = {
  master: GainNode;
  drone: { osc: OscillatorNode; gain: GainNode } | null;
  shimmer: Array<{ osc: OscillatorNode; gain: GainNode }>;
  filter: BiquadFilterNode;
  panner: StereoPannerNode;
  lfo: { osc: OscillatorNode; gain: GainNode } | null;
  // Слой энтрейнмента: несущая, чья громкость пульсирует на целевой частоте (AM).
  entrainment: {
    carrier: OscillatorNode;
    am: GainNode; // громкость осциллирует благодаря entLfo
    level: GainNode; // общий вкл/выкл слоя
    entLfo: OscillatorNode;
  };
};

let ctx: AudioContext | null = null;
let graph: Graph | null = null;
let currentPreset: AmbientPreset = 'ocean';
let currentVolume = 0.5;
let noiseBuffer: AudioBuffer | null = null;
// Сигналы фаз идут мимо графа фона: они звучат и без ambient,
// и когда setActive(false) глушит master.
let cueBus: GainNode | null = null;

function getCueBus(audioCtx: AudioContext): GainNode {
  if (!cueBus) {
    cueBus = audioCtx.createGain();
    cueBus.connect(audioCtx.destination);
  }
  // С фоном сигнал держит прежний баланс с ним, без фона звучит в полную силу.
  cueBus.gain.value = graph ? currentVolume * 0.7 : 0.7;
  return cueBus;
}

function getNoiseBuffer(audioCtx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  // 2 секунды pink-ish noise (просто отфильтрованный random).
  const length = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = 0.97 * last + white * 0.03;
    data[i] = last * 12;
  }
  noiseBuffer = buf;
  return buf;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  return ctx;
}

function buildGraph(audioCtx: AudioContext, preset: AmbientPreset): Graph {
  const cfg = AMBIENT_PRESETS[preset];

  const master = audioCtx.createGain();
  master.gain.value = 0;
  master.connect(audioCtx.destination);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cfg.filterCutoff;
  filter.Q.value = 0.7;
  filter.connect(master);

  const panner = audioCtx.createStereoPanner();
  panner.pan.value = 0;
  panner.connect(filter);

  let drone: Graph['drone'] = null;
  if (cfg.droneFreq > 0) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = cfg.droneFreq;
    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(filter);
    osc.start();
    drone = { osc, gain };
  }

  const shimmer: Graph['shimmer'] = cfg.shimmerFreqs.map((freq) => {
    const osc = audioCtx.createOscillator();
    osc.type = cfg.shimmerWave;
    osc.frequency.value = freq;
    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(panner);
    osc.start();
    return { osc, gain };
  });

  let lfo: Graph['lfo'] = null;
  if (shimmer.length > 0) {
    const lfoOsc = audioCtx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.value = 0.1;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.6;
    lfoOsc.connect(lfoGain).connect(panner.pan);
    lfoOsc.start();
    lfo = { osc: lfoOsc, gain: lfoGain };
  }

  // --- Слой энтрейнмента (амплитудная модуляция) ---
  // Несущая — мягкий синус, гармоничный базовому дрону (или 160 Гц для Silence).
  const carrierFreq = cfg.droneFreq > 0 ? cfg.droneFreq * 2 : 160;
  const carrier = audioCtx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.value = carrierFreq;

  // am.gain осциллирует вокруг 0.5 с амплитудой 0.5 → 0..1 (глубокая AM).
  const am = audioCtx.createGain();
  am.gain.value = 0.5;
  const entLfo = audioCtx.createOscillator();
  entLfo.type = 'sine';
  entLfo.frequency.value = 10;
  const entLfoDepth = audioCtx.createGain();
  entLfoDepth.gain.value = 0.5;
  entLfo.connect(entLfoDepth).connect(am.gain);

  // Общий уровень слоя (0 = выключен), мягко фильтруем чтобы не звенело.
  const entFilter = audioCtx.createBiquadFilter();
  entFilter.type = 'lowpass';
  entFilter.frequency.value = 700;
  const level = audioCtx.createGain();
  level.gain.value = 0;

  carrier.connect(am).connect(entFilter).connect(level).connect(master);
  carrier.start();
  entLfo.start();

  return {
    master,
    drone,
    shimmer,
    filter,
    panner,
    lfo,
    entrainment: { carrier, am, level, entLfo },
  };
}

function disposeGraph(audioCtx: AudioContext, g: Graph) {
  try {
    const now = audioCtx.currentTime;
    g.master.gain.cancelScheduledValues(now);
    g.master.gain.setTargetAtTime(0, now, 0.2);
    setTimeout(() => {
      try {
        g.drone?.osc.stop();
        g.shimmer.forEach((s) => s.osc.stop());
        g.lfo?.osc.stop();
        g.entrainment.carrier.stop();
        g.entrainment.entLfo.stop();
      } catch {
        // already stopped
      }
    }, 500);
  } catch {
    // ignore
  }
}

export async function ensureAudio(preset: AmbientPreset, volume: number): Promise<boolean> {
  const audioCtx = getCtx();
  if (!audioCtx) return false;
  currentPreset = preset;
  currentVolume = volume;
  // Не только suspended: после звонка Safari оставляет контекст в interrupted.
  if (audioCtx.state !== 'running') {
    try {
      await audioCtx.resume();
    } catch {
      return false;
    }
  }
  return audioCtx.state === 'running';
}

export function startAmbient(preset: AmbientPreset, volume: number) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (graph) disposeGraph(audioCtx, graph);
  currentPreset = preset;
  currentVolume = volume;
  graph = buildGraph(audioCtx, preset);
  graph.master.gain.setTargetAtTime(volume * 0.7, audioCtx.currentTime, 0.6);
}

export function stopAmbient() {
  stopActiveCue();
  if (!ctx || !graph) return;
  disposeGraph(ctx, graph);
  graph = null;
}

export function setVolume(volume: number) {
  currentVolume = volume;
  if (!ctx || !graph) return;
  graph.master.gain.setTargetAtTime(volume * 0.7, ctx.currentTime, 0.3);
}

// Включить/настроить слой энтрейнмента: целевая частота AM и громкость слоя.
export function setEntrainment(enabled: boolean, hz: number) {
  if (!ctx || !graph) return;
  const now = ctx.currentTime;
  const ent = graph.entrainment;
  ent.entLfo.frequency.setTargetAtTime(hz, now, 0.2);
  // Скромный уровень — это фон под ambient, а не основной звук.
  ent.level.gain.setTargetAtTime(enabled ? currentVolume * 0.16 : 0, now, 0.6);
}

export function setActive(active: boolean) {
  if (!ctx || !graph) return;
  graph.master.gain.cancelScheduledValues(ctx.currentTime);
  graph.master.gain.setTargetAtTime(
    active ? currentVolume * 0.7 : 0,
    ctx.currentTime,
    0.5,
  );
}

const PHASE_LEVELS = {
  inhale: { drone: 0.95, shimmer: 1, cutoffMul: 1, pitchMul: 1.015 },
  holdIn: { drone: 0.95, shimmer: 0.75, cutoffMul: 1, pitchMul: 1.015 },
  exhale: { drone: 0.55, shimmer: 0.65, cutoffMul: 0.75, pitchMul: 1 },
  holdOut: { drone: 0.55, shimmer: 0.4, cutoffMul: 0.7, pitchMul: 1 },
} as const;

function rampParam(
  param: AudioParam,
  startVal: number,
  endVal: number,
  startAt: number,
  endAt: number,
) {
  param.cancelScheduledValues(startAt);
  param.setValueAtTime(startVal, startAt);
  param.linearRampToValueAtTime(endVal, endAt);
}

type ActiveCue = {
  nodes: Array<OscillatorNode | AudioBufferSourceNode>;
  gain: GainNode;
};
let activeCue: ActiveCue | null = null;

// hard — без затухания: перед остановкой контекста плавный спад замёрз бы
// и доиграл после возврата.
function stopActiveCue(hard = false) {
  if (!ctx || !activeCue) return;
  const now = ctx.currentTime;
  const { nodes, gain } = activeCue;
  try {
    if (hard) {
      gain.disconnect();
      nodes.forEach((n) => {
        try {
          n.stop(now);
        } catch {
          // already stopped
        }
      });
      activeCue = null;
      return;
    }
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    nodes.forEach((n) => {
      try {
        n.stop(now + 0.2);
      } catch {
        // already stopped
      }
    });
  } catch {
    // ignore
  }
  activeCue = null;
}

// Фон в ритме дыхания и сигнал фазы. Без графа фона остаётся только сигнал.
export function onBreathPhase(phase: BreathingPhase, durationSec = 4) {
  rampAmbient(phase, durationSec);
  playPhaseCue(phase, durationSec);
}

function rampAmbient(phase: BreathingPhase, durationSec: number) {
  if (!ctx || !graph) return;
  const cfg = AMBIENT_PRESETS[currentPreset];
  const now = ctx.currentTime;
  const end = now + Math.max(durationSec, 0.05);
  const vol = currentVolume;

  const prev =
    phase === 'inhale'
      ? PHASE_LEVELS.holdOut
      : phase === 'holdIn'
        ? PHASE_LEVELS.inhale
        : phase === 'exhale'
          ? PHASE_LEVELS.holdIn
          : PHASE_LEVELS.exhale;
  const next = PHASE_LEVELS[phase];

  if (graph.drone) {
    rampParam(graph.drone.gain.gain, prev.drone * vol, next.drone * vol, now, end);
    rampParam(
      graph.drone.osc.frequency,
      cfg.droneFreq * prev.pitchMul,
      cfg.droneFreq * next.pitchMul,
      now,
      end,
    );
  }
  graph.shimmer.forEach((s) => {
    rampParam(
      s.gain.gain,
      cfg.shimmerGain * prev.shimmer * vol,
      cfg.shimmerGain * next.shimmer * vol,
      now,
      end,
    );
  });
  rampParam(
    graph.filter.frequency,
    cfg.filterCutoff * prev.cutoffMul,
    cfg.filterCutoff * next.cutoffMul,
    now,
    end,
  );
}

export function playPhaseCue(phase: BreathingPhase, durationSec = 4) {
  // В остановленном контексте тоны не планируются: после возврата они бы
  // прозвучали разом.
  if (!ctx || ctx.state !== 'running') return;
  const audioCtx = ctx;
  const out = getCueBus(audioCtx);
  const vol = currentVolume;
  const cfg = AMBIENT_PRESETS[currentPreset];
  const now = audioCtx.currentTime;
  const base = cfg.cueFreq;
  const duration = Math.max(durationSec, 0.3);

  stopActiveCue();

  const attack = Math.min(0.4, duration * 0.18);
  const release = Math.min(0.5, duration * 0.22);

  try {
    if (phase === 'inhale' || phase === 'exhale') {
      // Шум через bandpass, частота скользит снизу вверх (вдох) или сверху вниз (выдох).
      // Это интуитивный звук «потока воздуха».
      const noise = audioCtx.createBufferSource();
      noise.buffer = getNoiseBuffer(audioCtx);
      noise.loop = true;

      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.6;

      const lowF = base * 0.6;
      const highF = base * 2.2;
      const startF = phase === 'inhale' ? lowF : highF;
      const endF = phase === 'inhale' ? highF : lowF;
      bp.frequency.setValueAtTime(startF, now);
      bp.frequency.linearRampToValueAtTime(endF, now + duration);

      const g = audioCtx.createGain();
      const peak = vol * 0.28;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + attack);
      g.gain.linearRampToValueAtTime(peak * 0.9, now + duration - release);
      g.gain.linearRampToValueAtTime(0, now + duration + 0.05);

      noise.connect(bp).connect(g).connect(out);
      noise.start(now);
      noise.stop(now + duration + 0.15);
      activeCue = { nodes: [noise], gain: g };
    } else {
      // Задержки: пара расстроенных синусов даёт мягкое биение —
      // ощущение паузы, но не тишины.
      const high = phase === 'holdIn';
      const f1 = high ? base * 1.5 : base * 0.5;
      const f2 = high ? base * 1.5 + 4 : base * 0.5 + 3;

      const osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = f1;

      const osc2 = audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = f2;

      const g = audioCtx.createGain();
      const peak = vol * 0.14;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + attack);
      g.gain.linearRampToValueAtTime(peak * 0.9, now + duration - release);
      g.gain.linearRampToValueAtTime(0, now + duration + 0.05);

      osc1.connect(g);
      osc2.connect(g);
      g.connect(out);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.15);
      osc2.stop(now + duration + 0.15);
      activeCue = { nodes: [osc1, osc2], gain: g };
    }
  } catch {
    // ignore
  }
}

export type SignalKind = 'count' | 'step' | 'soft' | 'done';

// Ноты сигнала: [множитель частоты, задержка, длительность, громкость].
const SIGNAL_NOTES: Record<SignalKind, Array<[number, number, number, number]>> = {
  count: [[2, 0, 0.14, 0.2]],
  step: [
    [1.5, 0, 0.35, 0.2],
    [2, 0.16, 0.5, 0.2],
  ],
  soft: [[1, 0, 0.9, 0.16]],
  done: [
    [1, 0, 0.4, 0.2],
    [1.5, 0.18, 0.4, 0.2],
    [2, 0.36, 0.8, 0.2],
  ],
};

// Короткие сигналы вне дыхательных фаз: отсчёт, смена этапа, конец практики.
export function playSignal(kind: SignalKind) {
  if (!ctx || ctx.state !== 'running') return;
  const audioCtx = ctx;
  const out = getCueBus(audioCtx);
  const base = AMBIENT_PRESETS[currentPreset].cueFreq;
  const now = audioCtx.currentTime;
  try {
    SIGNAL_NOTES[kind].forEach(([mul, delay, duration, level]) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = base * mul;
      const g = audioCtx.createGain();
      const start = now + delay;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(currentVolume * level, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(g).connect(out);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  } catch {
    // ignore
  }
}

export function stopCues() {
  stopActiveCue();
}

// Сворачивание приложения: звук замирает до ensureAudio().
export function suspendAudio() {
  if (!ctx) return;
  stopActiveCue(true);
  if (ctx.state === 'running') {
    ctx.suspend().catch(() => {});
  }
}
