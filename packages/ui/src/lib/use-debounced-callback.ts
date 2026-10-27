import { useRef } from 'react';

// Debounce driven by the event (the keystroke), not by a useEffect that would watch a value:
// each call pushes back the previous one, only the last one runs after `delayMs`.
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, delayMs: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  return {
    run: (...args: Args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => callback(...args), delayMs);
    },
    cancel: () => clearTimeout(timer.current),
  };
}
