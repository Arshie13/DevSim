import { useEffect, useState } from 'react';

/**
 * Persists a piece of state in localStorage.
 *
 * The initial value is read lazily on first render, falling back to the
 * provided default when nothing is stored (or the stored JSON is corrupt).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Keep localStorage in sync with state changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode, quota) — ignore.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
