import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-context';
import { useTheme } from '@/stores/theme-context';
import { ADMIN_URL, STORE_URL } from '@/lib/urls';
import { Logo } from '@/components/Logo';

export function CorporateLayout() {
  const [open, setOpen] = useState(false);
  const { t, locale, toggleLocale, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/about', label: t.nav.about },
    { to: '/services', label: t.nav.services },
    { to: '/brands', label: t.nav.brands },
    { to: '/projects', label: t.nav.projects },
    { to: '/news', label: t.nav.news },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="mx-auto flex h-[4.25rem] max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Logo to="/" />

          <nav className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-white',
                    isActive && 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-accent',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="hidden h-9 min-w-9 items-center justify-center rounded-md text-[11px] font-semibold tracking-wider text-white/70 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              {locale === 'en' ? 'ع' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition hover:bg-white/5 hover:text-white"
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <a
              href={STORE_URL}
              className="btn-shine inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[12px] font-semibold tracking-tight text-white shadow-[0_6px_16px_-6px_rgb(0_112_192/0.55)] transition hover:-translate-y-0.5 hover:bg-accent-soft hover:shadow-[0_10px_20px_-6px_rgb(0_112_192/0.7)]"
            >
              {t.nav.store}
            </a>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center text-white lg:hidden"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-black px-4 py-4 lg:hidden">
            <div className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/5 py-3 text-sm text-white/85"
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  toggleLocale();
                  setOpen(false);
                }}
                className="border-b border-white/5 py-3 text-start text-sm text-white/85"
              >
                {locale === 'en' ? 'العربية' : 'English'}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
                className="border-b border-white/5 py-3 text-start text-sm text-white/85"
              >
                {theme === 'light' ? t.theme.dark : t.theme.light}
              </button>
              <a
                href={STORE_URL}
                className="mt-4 inline-flex h-10 items-center justify-center bg-accent text-sm font-semibold text-white"
              >
                {t.nav.openStore}
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex min-h-[calc(100svh-4.25rem)] flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-5">
            <Logo to="/" imgClassName="h-9 sm:h-10 max-w-[200px]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">{t.tagline}</p>
            <p className="mt-3 text-xs text-white/30">{t.legal}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {t.footer.explore}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/65">
                <Link to="/services" className="link-underline w-fit">
                  {t.nav.services}
                </Link>
                <Link to="/projects" className="link-underline w-fit">
                  {t.nav.projects}
                </Link>
                <Link to="/news" className="link-underline w-fit">
                  {t.nav.news}
                </Link>
                <Link to="/contact" className="link-underline w-fit">
                  {t.nav.contact}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {t.footer.company}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/65">
                <Link to="/about" className="link-underline w-fit">
                  {t.nav.about}
                </Link>
                <Link to="/brands" className="link-underline w-fit">
                  {t.nav.brands}
                </Link>
                <a href={STORE_URL} className="link-underline w-fit">
                  {t.nav.store}
                </a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {t.footer.access}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/65">
                <a href={ADMIN_URL} className="link-underline w-fit">
                  {t.footer.staff}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-2 px-4 py-5 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
            <span>
              © {new Date().getFullYear()} AT · {t.brand} · {t.brandAr}
            </span>
            <span>{t.footer.rights}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
