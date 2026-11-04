import {
  clampOffset,
  clampScale,
  MAX_SCALE,
  offsetAfterZoom,
} from '../zoomMath';

test('scale stays between the original size and the maximum', () => {
  expect(clampScale(0.4)).toBe(1);
  expect(clampScale(2)).toBe(2);
  expect(clampScale(99)).toBe(MAX_SCALE);
});

test('a photo cannot be dragged past its edges, and not at all at normal size', () => {
  expect(clampOffset(500, 1, 400)).toBe(0);
  expect(clampOffset(500, 2, 400)).toBe(200);
  expect(clampOffset(-500, 2, 400)).toBe(-200);
  expect(clampOffset(50, 2, 400)).toBe(50);
});

test('zooming keeps the point under the fingers where it was', () => {
  const focal = 100;
  const offset = offsetAfterZoom(0, focal, 1, 2);
  const contentPoint = focal;
  expect(2 * contentPoint + offset).toBe(focal);
});

test('zooming about the centre needs no shift, and zooming back out returns to it', () => {
  expect(offsetAfterZoom(0, 0, 1, 3)).toBe(0);
  expect(offsetAfterZoom(offsetAfterZoom(0, 80, 1, 2), 80, 2, 1)).toBe(0);
});
