
/**
 * Parses a subscriber count string into a raw number.
 * Handles formats like: "1.5M", "100K", "10k", "500", "1,000", "Any".
 */
export const parseSubscriberCount = (str: string | undefined | null | number): number => {
  if (str === undefined || str === null || str === '' || str === 'Any') return 0;
  if (typeof str === 'number') return str;

  // Normalize: remove commas, spaces, convert to uppercase
  const clean = str.toString().replace(/,/g, '').trim().toUpperCase();

  // Extract numeric part
  const numPart = parseFloat(clean.replace(/[^0-9.]/g, ''));
  if (isNaN(numPart)) return 0;

  if (clean.includes('B')) return numPart * 1000000000;
  if (clean.includes('M')) return numPart * 1000000;
  if (clean.includes('K')) return numPart * 1000;

  return numPart;
};

/**
 * Formats a raw number into a friendly string (e.g., 1500 -> 1K, 1500000 -> 1.5M).
 */
export const formatSubscriberCount = (num: number): string => {
   if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
   if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
   if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
   return num.toString();
};
