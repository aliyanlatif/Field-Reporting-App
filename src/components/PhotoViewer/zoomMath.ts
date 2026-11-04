export const MAX_SCALE = 4;
export const DOUBLE_TAP_SCALE = 2.5;
/** Below this the photo counts as "not zoomed", so paging and swipe-to-close work again. */
export const ZOOMED_ABOVE = 1.02;

export const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(1, scale));

/** How far a photo of `size` may be dragged at `scale` before its edge leaves the screen. */
export const clampOffset = (offset: number, scale: number, size: number) => {
  const limit = (size * (scale - 1)) / 2;
  return Math.max(-limit, Math.min(limit, offset));
};

/** The offset that keeps the content under `focal` (measured from the screen centre) still while zooming from one scale to another. */
export const offsetAfterZoom = (
  offset: number,
  focal: number,
  from: number,
  to: number,
) => focal - ((focal - offset) * to) / from;
