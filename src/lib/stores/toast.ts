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
  const MAX_TOASTS = 3;

  function add(message: string, variant: ToastVariant, duration = 4000, options?: ToastOptions) {
    const newId = ++nextId;
    update((toasts) => {
      // Deduplicate error/warn toasts so the ErrorPopup never shows the same message twice.
      // Success/info toasts are left untouched — the Toast component already filters out
      // error/warn, so this only affects the ErrorPopup.
      if (variant === 'error' || variant === 'warn') {
        const exists = toasts.some((t) => t.variant === variant && t.message === message);
        if (exists) return toasts;
      }
      const next = [...toasts, { id: newId, message, variant, duration, helpAction: options?.helpAction }];
      if (next.length > MAX_TOASTS) {
        next.splice(0, next.length - MAX_TOASTS);
      }
      return next;
    });

    if (duration > 0) {
      setTimeout(() => remove(newId), duration);
    }

    return newId;
  }

  function remove(id: number) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    remove,
    error:   (msg: string, duration?: number, options?: ToastOptions) => add(msg, 'error', duration ?? 0, options),
    warn:    (msg: string, duration?: number, options?: ToastOptions) => add(msg, 'warn',  duration ?? 0, options),
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    info:    (msg: string, duration?: number) => add(msg, 'info',  duration),
  };
}

export const toast = createToastStore();
