import { writable } from 'svelte/store';

export type ToastVariant = 'error' | 'warn' | 'success' | 'info';

export interface ToastAction {
  label: string;
  category: string;
}

export interface ToastOptions {
  helpAction?: ToastAction;
}

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
  helpAction?: ToastAction;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 0;

  function add(message: string, variant: ToastVariant, duration = 4000, options?: ToastOptions) {
    const id = ++nextId;
    update((toasts) => [...toasts, { id, message, variant, duration, helpAction: options?.helpAction }]);

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
    error:   (msg: string, duration?: number, options?: ToastOptions) => add(msg, 'error', duration, options),
    warn:    (msg: string, duration?: number, options?: ToastOptions) => add(msg, 'warn',  duration, options),
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    info:    (msg: string, duration?: number) => add(msg, 'info',  duration),
  };
}

export const toast = createToastStore();
