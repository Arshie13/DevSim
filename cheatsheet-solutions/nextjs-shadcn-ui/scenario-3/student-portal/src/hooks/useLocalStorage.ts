import { useEffect, useState } from 'react';

/**
 * State that survives a reload via localStorage.
 *
 * Mirrors useState but hydrates from storage on first render and writes back on
 * every change, so the sidebar, notes page and login form share one pattern.
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

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode, quota) — ignore.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
