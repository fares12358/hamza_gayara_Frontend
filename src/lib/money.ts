/** Money is stored as whole piasters. This file is the only place that converts. */

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export const formatMoney = (piasters: number) => formatter.format(piasters / 100);

/**
 * Reads what the user typed (Arabic or English digits) into piasters.
 * Empty text is 0. Anything unclear returns null: it is never guessed.
 */
export function parseMoney(text: string, { allowNegative = false } = {}): number | null {
  const typed = text
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',')
    .trim();
  if (typed === '') return 0;
  // "12,50" or "1 5" must never turn into 1250 or 15: commas are allowed only between groups of three.
  if (/\s/.test(typed) || (typed.includes(',') && !/^-?\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(typed))) return null;
  const clean = typed.replace(/,/g, '');
  const match = clean.match(/^(-?)(\d{1,10})(?:\.(\d{1,2}))?$/);
  if (!match || (match[1] && !allowNegative)) return null;
  const value = Number(match[2]) * 100 + Number((match[3] ?? '').padEnd(2, '0'));
  return match[1] ? -value : value;
}

/** Balances under half a pound count as settled. Same rule as the server. */
export const SETTLED = 50;
