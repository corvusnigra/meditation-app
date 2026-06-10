import type {
  CompletedSession,
  ProgressionState,
  UserSettings,
} from './types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

const isBrowser = (): boolean => typeof window !== 'undefined';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
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
    return read<CompletedSession[]>(STORAGE_KEYS.sessions, []);
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
    const stored = read<Partial<UserSettings> | null>(STORAGE_KEYS.settings, null);
    return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  },
  save(settings: UserSettings): void {
    write(STORAGE_KEYS.settings, settings);
  },
  clear(): void {
    remove(STORAGE_KEYS.settings);
  },
};

const DEFAULT_PROGRESSION: ProgressionState = {
  currentLevel: 1,
  offeredUpgrade: false,
  declinedAt: null,
  lastStreakBeforeBreak: 0,
  customDurations: null,
};

export const progressionStorage = {
  load(): ProgressionState {
    const stored = read<Partial<ProgressionState> | null>(STORAGE_KEYS.progression, null);
    return { ...DEFAULT_PROGRESSION, ...(stored ?? {}) };
  },
  save(state: ProgressionState): void {
    write(STORAGE_KEYS.progression, state);
  },
  clear(): void {
    remove(STORAGE_KEYS.progression);
  },
};

export function clearAllStorage(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}
