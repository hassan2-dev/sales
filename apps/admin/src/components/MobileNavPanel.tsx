import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, X } from 'lucide-react';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-context';
import { useTheme } from '@/stores/theme-context';

export type MobileNavLink = {
  to: string;
  label: string;
};

export type MobileNavAction = {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary' | 'ghost';
};

type MobileNavPanelProps = {
  open: boolean;
  onClose: () => void;
  logoTo?: string;
  links: MobileNavLink[];
  middle?: ReactNode;
  actions: MobileNavAction[];
  extraTools?: ReactNode;
  hideFrom?: 'md' | 'lg';
};

export function MobileNavPanel({
  open,
  onClose,
  logoTo = '/',
  links,
  middle,
  actions,
  extraTools,
  hideFrom = 'lg',
}: MobileNavPanelProps) {
  const { locale, toggleLocale, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const hideClass = hideFrom === 'md' ? 'md:hidden' : 'lg:hidden';

  return (
    <div
      className={cn(
        'fixed inset-0 z-80',
        hideClass,
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close menu"
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute inset-0 flex flex-col bg-page text-fg transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
          <Logo to={logoTo} onClick={onClose} imgClassName="h-9 max-w-[150px]" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card text-fg shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {middle}

        <nav className="flex flex-1 flex-col items-center justify-center gap-1 overflow-y-auto px-6 py-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={onClose}
              className="w-full py-3 text-center text-[1.65rem] font-extrabold tracking-tight text-fg transition hover:text-accent sm:text-3xl"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="mb-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-bold text-muted hover:bg-secondary"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-secondary"
              aria-label={theme === 'light' ? 'Dark' : 'Light'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {extraTools}
          </div>

          {actions.map((action) => {
            const className =
              action.variant === 'primary'
                ? 'inline-flex h-12 w-full items-center justify-center rounded-2xl bg-accent text-base font-bold text-white shadow-[0_10px_28px_-10px_rgb(0_112_192/0.65)] transition hover:bg-accent-soft'
                : action.variant === 'secondary'
                  ? 'inline-flex h-12 w-full items-center justify-center rounded-2xl border-2 border-accent bg-card text-base font-bold text-accent transition hover:bg-accent/10'
                  : 'inline-flex h-10 w-full items-center justify-center text-sm font-semibold text-muted';

            if (action.href) {
              return (
                <a key={action.label} href={action.href} className={className}>
                  {action.label}
                </a>
              );
            }
            if (action.to) {
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  onClick={() => {
                    action.onClick?.();
                    onClose();
                  }}
                  className={className}
                >
                  {action.label}
                </Link>
              );
            }
            return (
              <button
                key={action.label}
                type="button"
                className={className}
                onClick={() => {
                  action.onClick?.();
                  onClose();
                }}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
