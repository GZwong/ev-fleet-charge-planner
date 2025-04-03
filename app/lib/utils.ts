/**
 * Construct an array with num points between start and stop (excluding stop)
 * @param start - First value of the array
 * @param stop - Last value of the array
 * @param num - Number of points between start and stop
 * @returns Array with size `num` between `start` and `stop`
 */
export function linspace(start: number, stop: number, num: number): number[] {
  if (num <= 1) return [start];

  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + i * step);
}

/**
 * Convert a traditional string to a format compatible with html IDs
 * @param str - Input string (usually one containing spaces)
 * @returns A modified string with all lower cases and hyphens replacing space
 */
export function toHtmlId(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-");
}
