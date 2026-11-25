/** For searching: أ/إ/آ = ا, ة = ه, ى = ي. Same idea as the server's name check. */
export const normalizeArabic = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const matchesName = (query: string, ...names: string[]) => {
  const q = normalizeArabic(query);
  return !q || names.some((n) => normalizeArabic(n).includes(q));
};
