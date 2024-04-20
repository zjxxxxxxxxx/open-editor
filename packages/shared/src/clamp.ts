export function clamp(val: number, start: number, end: number) {
  return Math.min(Math.max(val, start), end);
}
