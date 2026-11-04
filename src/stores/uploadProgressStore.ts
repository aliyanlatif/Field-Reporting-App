import { create } from 'zustand';

/** Smallest change worth a re-render: a 5 MB photo would otherwise update hundreds of times. */
const MIN_STEP = 0.02;

interface UploadProgressState {
  /** Fraction (0 to 1) of each image already sent, by image id. Memory only: the queue in SQLite is the truth. */
  fractions: Record<string, number>;
  report: (imageId: string, fraction: number) => void;
  clear: () => void;
}

export const useUploadProgressStore = create<UploadProgressState>()(
  (set, get) => ({
    fractions: {},

    report(imageId, fraction) {
      const previous = get().fractions[imageId] ?? 0;
      const settled = fraction === 0 || fraction === 1;
      if (!settled && Math.abs(fraction - previous) < MIN_STEP) {
        return;
      }
      set(state => ({
        fractions: { ...state.fractions, [imageId]: fraction },
      }));
    },

    clear: () => set({ fractions: {} }),
  }),
);
