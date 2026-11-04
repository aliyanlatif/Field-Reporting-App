import { create } from 'zustand';

export type ToastKind = 'ok' | 'bad' | 'amber' | 'neutral';

export interface ToastMessage {
  id: number;
  text: string;
  kind: ToastKind;
}

interface ToastState {
  toast: ToastMessage | null;
  show: (text: string, kind?: ToastKind) => void;
  hide: () => void;
}

let nextId = 1;

/** One short message at a time. A new one replaces the old, so messages never pile up. */
export const useToastStore = create<ToastState>()(set => ({
  toast: null,
  show: (text, kind = 'neutral') =>
    set({ toast: { id: nextId++, text, kind } }),
  hide: () => set({ toast: null }),
}));

export const showToast = (text: string, kind?: ToastKind) =>
  useToastStore.getState().show(text, kind);
