/** Stroke icons from the Soft design, all drawn on a 24x24 grid. */
export type IconShape =
  | { type: 'path'; d: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | {
      type: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx: number;
    };

const path = (d: string): IconShape => ({ type: 'path', d });
const circle = (cx: number, cy: number, r: number): IconShape => ({
  type: 'circle',
  cx,
  cy,
  r,
});

const CAMERA_BODY = 'M4 8h3l2-3h6l2 3h3v11H4z';

export const icons = {
  refresh: [path('M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5')],
  settings: [
    path('M4 7h10M18 7h2M4 17h2M10 17h10'),
    circle(16, 7, 2),
    circle(8, 17, 2),
  ],
  check: [path('M5 12.5l4.5 4.5L19 7.5')],
  arrowUp: [path('M12 19V5M6 11l6-6 6 6')],
  clock: [circle(12, 12, 8.5), path('M12 7.5V12l3 2')],
  phone: [
    { type: 'rect', x: 7, y: 3, width: 10, height: 18, rx: 2.5 },
    path('M11 18h2'),
  ],
  warning: [path('M12 4l9 16H3zM12 10v4M12 17.2h.01')],
  camera: [path(CAMERA_BODY), circle(12, 13.5, 3.5)],
  gallery: [
    { type: 'rect', x: 4, y: 5, width: 16, height: 14, rx: 2.5 },
    circle(9, 10, 1.5),
    path('M4 16l5-4.5 4 3.5 3-2.5 4 3.5'),
  ],
  plus: [path('M12 5v14M5 12h14')],
  close: [path('M6 6l12 12M18 6L6 18')],
  back: [path('M15 5l-7 7 7 7')],
  trash: [path('M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13')],
  offline: [
    path(
      'M3 3l18 18M5 12.5a10 10 0 0 1 4-2.3M16 10.4a10 10 0 0 1 3 2.1M8.5 16a5 5 0 0 1 3.5-1.5 5 5 0 0 1 1.8.4M12 19.5h.01',
    ),
  ],
} as const satisfies Record<string, readonly IconShape[]>;

export type IconName = keyof typeof icons;
