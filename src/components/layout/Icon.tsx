const paths = {
  customers: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 4.15a3.5 3.5 0 0 1 0 6.7',
  invoice: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  treasury: 'M4 7h16v12H4zM4 10h16M15 14.5h2M7 7l8-3 1 3',
  cheque: 'M3 6h18v12H3zM7 14h6M7 10h3M16 10h2',
  income: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  users: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M5 21a7 7 0 0 1 14 0',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',
  logout: 'M10 5H5v14h5M14 8l4 4-4 4M18 12H9',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 8v5M12 16.5v.5M12 3L2.5 20h19z',
  right: 'M9 5l7 7-7 7',
  left: 'M15 5l-7 7 7 7',
  down: 'M6 9l6 6 6-6',
  key: 'M14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0M13 13l7 7M17 17l2-2',
  history: 'M12 7v5l3 2M4 12a8 8 0 1 0 2.5-5.8L4 8.5M4 4v4.5h4.5',
  arrowLeft: 'M20 12H4M10 6l-6 6 6 6',
};

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={paths[name]} />
    </svg>
  );
}
