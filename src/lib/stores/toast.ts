import { writable } from 'svelte/store';

export type ToastVariant = 'error' | 'warn' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 0;

  function add(message: string, variant: ToastVariant = 'info', duration = 4000) {
    const id = ++nextId;
    update((toasts) => [...toasts, { id, message, variant, duration }]);

    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }

    return id;
  }

  function remove(id: number) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    remove,
    error:   (msg: string, duration?: number) => add(msg, 'error', duration),
    warn:    (msg: string, duration?: number) => add(msg, 'warn',  duration),
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    info:    (msg: string, duration?: number) => add(msg, 'info',  duration),
  };
}

export const toast = createToastStore();
