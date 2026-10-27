import { useSyncExternalStore } from 'react';

// Whether the bag flyout is open, and the last refusal to show in it.
// An external store rather than React state: the bag action (a route action, outside React)
// opens the flyout after an add, and components read it with useSyncExternalStore.
type BagUi = { open: boolean; error: string | null };

let state: BagUi = { open: false, error: null };
const listeners = new Set<() => void>();

const set = (next: BagUi) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const bagUi = {
  // After an add: show the new line, or why it was refused.
  show: (error: string | null = null) => set({ open: true, error }),
  fail: (error: string) => set({ ...state, error }),
  clearError: () => set({ ...state, error: null }),
  // Closing also forgets the last refusal.
  setOpen: (open: boolean) => set({ open, error: open ? state.error : null }),
};

export const useBagUi = () => useSyncExternalStore(subscribe, () => state, () => state);
