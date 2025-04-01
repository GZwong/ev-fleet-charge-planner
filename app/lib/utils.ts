export function linspace(start: number, stop: number, num: number): number[] {
  if (num <= 1) return [start];

  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + i * step);
}
