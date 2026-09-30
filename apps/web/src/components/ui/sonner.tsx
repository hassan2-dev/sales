import type { CSSProperties } from 'react';
import {
  CircleCheck,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/stores/theme-context';
import { useI18n } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';

export function Toaster({ className, ...props }: ToasterProps) {
  const { theme } = useTheme();
  const { dir, locale } = useI18n();

  return (
    <Sonner
      key={locale}
      theme={theme}
      dir={dir}
      position={locale === 'ar' ? 'top-left' : 'top-right'}
      className={cn('toaster group', className)}
      closeButton
      expand
      gap={10}
      visibleToasts={3}
      duration={2800}
      icons={{
        success: <CircleCheck className="size-4 text-accent" />,
        info: <Info className="size-4 text-accent" />,
        warning: <TriangleAlert className="size-4 text-amber-500" />,
        error: <OctagonX className="size-4 text-destructive" />,
        loading: <Loader2 className="size-4 animate-spin text-accent" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast !border !border-border !bg-popover !text-popover-foreground',
            '!shadow-[0_16px_40px_-18px_rgb(0_0_0/0.4)] !rounded-xl',
            '!px-4 !py-3.5 !gap-3',
            'data-[type=success]:!border-accent/30',
            'data-[type=error]:!border-destructive/35',
          ),
          title: '!text-sm !font-semibold !tracking-tight !text-foreground',
          description: '!text-xs !text-muted-foreground',
          actionButton: '!bg-accent !text-white !rounded-lg !text-xs !font-bold',
          cancelButton: '!bg-muted !text-muted-foreground !rounded-lg !text-xs',
          closeButton:
            '!border-border !bg-popover !text-muted-foreground hover:!bg-muted hover:!text-foreground',
        },
      }}
      {...props}
    />
  );
}
