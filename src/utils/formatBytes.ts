const MEGABYTE = 1024 * 1024;

/** 2411724 -> "2.3". Always one decimal, so a list of sizes lines up. */
export const toMegabytes = (bytes: number) => (bytes / MEGABYTE).toFixed(1);

/** "18.2 → 2.3 MB" when the photo was shrunk, "1.4 MB" when it was already small. */
export function describeShrink(originalBytes: number, finalBytes: number) {
  const before = toMegabytes(originalBytes);
  const after = toMegabytes(finalBytes);
  return originalBytes > finalBytes && before !== after
    ? `${before} → ${after} MB`
    : `${after} MB`;
}
