import type {
  CompletedSession,
  ProgressionState,
  TechniqueLevels,
  UserSettings,
} from './types';
import { STORAGE_KEYS } from './constants';
import {
  normalizeProgression,
  normalizeSessions,
  normalizeSettings,
  normalizeTechniqueLevels,
} from './validate';

const isBrowser = (): boolean => typeof window !== 'undefined';

function safeParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Формат прочитанного не гарантирован — к типу его приводят нормализаторы.
function read(key: string): unknown {
  if (!isBrowser()) return null;
  return safeParse(window.localStorage.getItem(key));
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // QuotaExceeded или приватный режим — тихо игнорируем
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export const sessionsStorage = {
  load(): CompletedSession[] {
    return normalizeSessions(read(STORAGE_KEYS.sessions));
  },
  save(sessions: CompletedSession[]): void {
    write(STORAGE_KEYS.sessions, sessions);
  },
  append(session: CompletedSession): CompletedSession[] {
    const list = this.load();
    list.push(session);
    this.save(list);
    return list;
  },
  clear(): void {
    remove(STORAGE_KEYS.sessions);
  },
};

export const settingsStorage = {
  load(): UserSettings {
    return normalizeSettings(read(STORAGE_KEYS.settings));
  },
  save(settings: UserSettings): void {
    write(STORAGE_KEYS.settings, settings);
  },
  clear(): void {
    remove(STORAGE_KEYS.settings);
  },
};

export const progressionStorage = {
  load(): ProgressionState {
    return normalizeProgression(read(STORAGE_KEYS.progression));
  },
  save(state: ProgressionState): void {
    write(STORAGE_KEYS.progression, state);
  },
  clear(): void {
    remove(STORAGE_KEYS.progression);
  },
};

export const techniqueLevelsStorage = {
  load(): TechniqueLevels {
    return normalizeTechniqueLevels(read(STORAGE_KEYS.techniqueLevels));
  },
  save(levels: TechniqueLevels): void {
    write(STORAGE_KEYS.techniqueLevels, levels);
  },
  clear(): void {
    remove(STORAGE_KEYS.techniqueLevels);
  },
};

export function clearAllStorage(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}
