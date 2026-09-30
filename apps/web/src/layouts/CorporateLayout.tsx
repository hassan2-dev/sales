import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-context';
import { useTheme } from '@/stores/theme-context';
import { ADMIN_URL, STORE_URL } from '@/lib/urls';
import { Logo } from '@/components/Logo';
import { MobileNavPanel } from '@/components/MobileNavPanel';
import {
  HeaderScrollProgress,
  ScrollToTopButton,
  useSiteScrollChrome,
} from '@/components/SiteScrollChrome';

export function CorporateLayout() {
  const [open, setOpen] = useState(false);
  const { t, locale, toggleLocale, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { progress, showTop } = useSiteScrollChrome();

  const links = [
    { to: '/about', label: t.nav.about },
    { to: '/services', label: t.nav.services },
    { to: '/brands', label: t.nav.brands },
    { to: '/projects', label: t.nav.projects },
    { to: '/news', label: t.nav.news },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-page text-fg" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="mx-auto flex h-14 min-w-0 max-w-[90rem] items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-4 sm:px-6 lg:px-10">
          <Logo
            to="/"
            imgClassName="h-8 max-w-[120px] sm:h-10 sm:max-w-[200px]"
            className="min-w-0 shrink"
          />

          <nav className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-white',
                    isActive &&
                      'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-accent',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
              className="hidden h-9 w-9 items-center justify-center rounded-md text-white/70 transition hover:bg-white/5 hover:text-white sm:inline-flex"
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <a
              href={STORE_URL}
              className="btn-shine hidden h-9 items-center rounded-lg bg-accent px-4 text-[12px] font-semibold tracking-tight text-white shadow-[0_6px_16px_-6px_rgb(0_112_192/0.55)] transition hover:bg-accent-soft sm:inline-flex"
            >
              {t.nav.store}
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <HeaderScrollProgress progress={progress} />
      </header>

      <MobileNavPanel
        open={open}
        onClose={() => setOpen(false)}
        logoTo="/"
        hideFrom="lg"
        links={links}
        actions={[
          { label: t.nav.openStore, href: STORE_URL, variant: 'primary' },
          { label: t.nav.contact, to: '/contact', variant: 'secondary' },
        ]}
      />

      <main className="flex min-h-[calc(100svh-3.5rem)] min-w-0 flex-1 flex-col overflow-x-clip sm:min-h-[calc(100svh-4.25rem)]">
        <Outlet />
      </main>

      <ScrollToTopButton show={showTop} />

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
