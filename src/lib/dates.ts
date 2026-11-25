const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const isoInCairo = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const todayIso = () => isoInCairo(new Date());

export const daysAgoIso = (days: number) => isoInCairo(new Date(Date.now() - days * 86_400_000));

/** 2026-03-05 -> 05/03/2026 */
export const formatDate = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');

/** 2026-03-05 -> الخميس 5 مارس 2026 */
export const formatLongDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  const day = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', timeZone: 'UTC' }).format(date);
  return `${day} ${date.getUTCDate()} ${monthName(iso)} ${date.getUTCFullYear()}`;
};

export const monthName = (month: string) => MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
