import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-fg outline-none transition placeholder:text-slate-500 placeholder:opacity-100 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:placeholder:text-slate-400',
        className,
      )}
      {...props}
    />
  );
});
