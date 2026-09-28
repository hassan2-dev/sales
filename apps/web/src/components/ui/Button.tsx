import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'btn-shine bg-accent text-white shadow-[0_8px_24px_-8px_rgb(0_112_192/0.55)] hover:bg-accent-soft hover:shadow-[0_12px_28px_-8px_rgb(0_112_192/0.7)] hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-[#0a0a0a] text-white shadow-md hover:bg-accent hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-accent dark:hover:text-white',
  ghost: 'bg-transparent text-fg hover:bg-black/5 dark:hover:bg-white/5',
  outline:
    'border-2 border-line bg-transparent text-fg hover:border-accent hover:text-accent hover:-translate-y-0.5 active:translate-y-0',
  danger: 'bg-red-700 text-white hover:bg-red-800 hover:-translate-y-0.5',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-[3.25rem] px-7 text-[15px] rounded-xl',
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
