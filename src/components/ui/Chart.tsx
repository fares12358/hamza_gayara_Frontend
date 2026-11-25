import { useEffect, useRef } from 'react';
import {
  BarController, BarElement, CategoryScale, Chart as ChartJs, Legend, LineController, LineElement,
  LinearScale, PointElement, Tooltip,
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { formatMoney } from '../../lib/money';

ChartJs.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface Series {
  label: string;
  /** piasters */
  values: number[];
  /** a color token from index.css */
  color: 'chart-1' | 'chart-2' | 'late';
}

interface Props {
  title: string;
  labels: string[];
  series: Series[];
  type?: 'bar' | 'line';
  /** Bars from the side: for names. */
  horizontal?: boolean;
  stacked?: boolean;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

/** A Chart.js chart in a card, right to left, using the theme colors. The figures are also in the tables. */
export function Chart({ title, labels, series, type = 'bar', horizontal = false, stacked = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const data = JSON.stringify([labels, series]);

  useEffect(() => {
    // Wait one frame so the colors of a just-changed theme are applied.
    let chart: ChartJs | undefined;
    const frame = requestAnimationFrame(() => {
      if (!canvas.current) return;
      const ink = token('muted');
      const grid = token('line');
      const surface = token('surface');
      const font = { family: "'IBM Plex Sans Arabic', sans-serif", size: 12 };
      const values = { grid: { color: grid }, border: { display: false }, ticks: { color: ink, font, callback: (v: string | number) => compact.format(Number(v)) } };
      const nameTicks = { color: ink, font, autoSkip: !horizontal, maxRotation: 0 };
      // Names beside the bars are shortened to fit narrow screens. The tooltip shows the full name.
      const limit = canvas.current.clientWidth < 420 ? 18 : 40;
      const shorten = (value: string | number) => {
        const name = labels[Number(value)] ?? '';
        return name.length > limit ? `${name.slice(0, limit)}…` : name;
      };
      const names = { grid: { display: false }, border: { color: grid }, ticks: horizontal ? { ...nameTicks, callback: shorten } : nameTicks };

      chart = new ChartJs(canvas.current, {
        type,
        data: {
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.values.map((v) => v / 100),
            backgroundColor: token(s.color),
            borderColor: type === 'line' ? token(s.color) : surface,
            borderWidth: type === 'line' ? 2 : stacked ? { top: 2 } : 0,
            borderRadius: stacked ? 0 : 4,
            maxBarThickness: 28,
            pointRadius: labels.length > 40 ? 0 : 3,
            pointHoverRadius: 5,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 400 },
          indexAxis: horizontal ? 'y' : 'x',
          interaction: { mode: 'index', intersect: false, axis: horizontal ? 'y' : 'x' },
          // Right to left: values and time start from the right.
          scales: horizontal
            ? { x: { ...values, reverse: true, stacked }, y: { ...names, position: 'right', stacked } }
            : { x: { ...names, reverse: true, stacked }, y: { ...values, position: 'right', stacked } },
          plugins: {
            legend: { display: series.length > 1, rtl: true, textDirection: 'rtl', labels: { color: ink, font, boxWidth: 12, boxHeight: 12 } },
            tooltip: {
              rtl: true,
              textDirection: 'rtl',
              titleFont: font,
              bodyFont: font,
              callbacks: { label: (item) => ` ${item.dataset.label}: ${formatMoney(Math.round(Number(item.raw) * 100))}` },
            },
          },
        },
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      chart?.destroy();
    };
    // "data" stands for labels and series.
  }, [data, theme, type, horizontal, stacked]); // eslint-disable-line react-hooks/exhaustive-deps

  const height = horizontal ? Math.max(180, labels.length * 34 + 60) : 280;

  return (
    <figure className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <figcaption className="mb-3 font-display font-bold">{title}</figcaption>
      {labels.length ? (
        <div className="relative" style={{ height }}>
          <canvas ref={canvas} role="img" aria-label={title} />
        </div>
      ) : (
        <p className="py-8 text-center text-muted">مفيش بيانات للرسم</p>
      )}
    </figure>
  );
}
