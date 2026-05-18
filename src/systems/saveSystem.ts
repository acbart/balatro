import type { RunState } from '../models/run';

const SAVE_KEY = 'balatro-lite-save-v1';

export const saveRun = (state: RunState): void => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
};

export const loadRun = (): RunState | null => {
  const payload = localStorage.getItem(SAVE_KEY);
  return payload ? (JSON.parse(payload) as RunState) : null;
};

export const clearRun = (): void => {
  localStorage.removeItem(SAVE_KEY);
};
