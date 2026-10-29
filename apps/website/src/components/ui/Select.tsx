import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded-sm border border-line bg-[var(--card)] px-3 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
