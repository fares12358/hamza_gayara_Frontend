import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover border-transparent',
  secondary: 'bg-surface text-ink border-line hover:bg-raised',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-raised hover:text-ink',
  danger: 'bg-transparent text-danger border-transparent hover:bg-raised',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  loading?: boolean;
  /** md: normal. sm: inside tables. icon: square, icon only. */
  size?: 'md' | 'sm' | 'icon';
}

const sizes = { md: 'px-4', sm: 'px-3 text-sm', icon: 'w-11 shrink-0' };

export function Button({ variant = 'secondary', size = 'md', loading, disabled, className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border font-semibold transition-[background-color,transform] active:scale-[0.98] disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? 'لحظة…' : children}
    </button>
  );
}
