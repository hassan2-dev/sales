import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  LifeBuoy,
  Briefcase,
  FolderKanban,
  Newspaper,
  Award,
  File,
  Building2,
  UserCog,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  FolderTree,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useAuth } from '@/stores/auth-context';
import { useTheme } from '@/stores/theme-context';
import { useI18n } from '@/i18n/i18n-context';
import { LoadingState } from '@/components/ui/States';
import { Logo } from '@/components/Logo';
import { adminPath, SITE_URL } from '@/lib/urls';
import { cn } from '@/lib/cn';

type NavKey =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'quotes'
  | 'support'
  | 'services'
  | 'projects'
  | 'news'
  | 'brands'
  | 'pages'
  | 'offices'
  | 'users'
  | 'auditLogs'
  | 'settings';

type GroupKey = 'groupMain' | 'groupSales' | 'groupContent' | 'groupSystem';

const navGroups: {
  group: GroupKey;
  items: {
    to: string;
    key: NavKey;
    icon: typeof LayoutDashboard;
    end?: boolean;
  }[];
}[] = [
  {
    group: 'groupMain',
    items: [{ to: '', key: 'overview', icon: LayoutDashboard, end: true }],
  },
  {
    group: 'groupSales',
    items: [
      { to: 'products', key: 'products', icon: Package },
      { to: 'categories', key: 'categories', icon: FolderTree },
      { to: 'orders', key: 'orders', icon: ShoppingBag },
      { to: 'customers', key: 'customers', icon: Users },
      { to: 'quotes', key: 'quotes', icon: FileText },
      { to: 'support', key: 'support', icon: LifeBuoy },
    ],
  },
  {
    group: 'groupContent',
    items: [
      { to: 'services', key: 'services', icon: Briefcase },
      { to: 'projects', key: 'projects', icon: FolderKanban },
      { to: 'news', key: 'news', icon: Newspaper },
      { to: 'brands', key: 'brands', icon: Award },
      { to: 'pages', key: 'pages', icon: File },
      { to: 'offices', key: 'offices', icon: Building2 },
    ],
  },
  {
    group: 'groupSystem',
    items: [
      { to: 'users', key: 'users', icon: UserCog },
      { to: 'audit-logs', key: 'auditLogs', icon: ScrollText },
      { to: 'settings', key: 'settings', icon: Settings },
    ],
  },
];

const SIDEBAR_KEY = 'eh_admin_sidebar_collapsed';

function SidebarNav({
  onNavigate,
  collapsed,
  className,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <nav className="no-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-4 text-[13px]">
        {navGroups.map((section) => (
          <div key={section.group}>
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-muted">
                {t.admin[section.group]}
              </p>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to || 'home'}
                    to={adminPath(item.to)}
                    end={item.end}
                    title={t.admin[item.key]}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sidebar-fg/75 transition hover:bg-sidebar-hover hover:text-sidebar-fg',
                        collapsed && 'justify-center px-2',
                        isActive &&
                          'bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    {!collapsed ? <span>{t.admin[item.key]}</span> : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={toggleTheme}
          title={t.admin.appearance}
          className={cn(
            'flex w-full items-center rounded-lg px-2.5 py-2 text-[13px] text-sidebar-fg/75 transition hover:bg-sidebar-hover hover:text-sidebar-fg',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <span className="flex items-center gap-2.5">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {!collapsed ? t.admin.appearance : null}
          </span>
          {!collapsed ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
              {theme === 'light' ? t.theme.dark : t.theme.light}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          title={t.admin.signOut}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-red-600 transition hover:bg-red-500/10 dark:text-red-400',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? t.admin.signOut : null}
        </button>
        <a
          href={SITE_URL}
          title={t.admin.backWebsite}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-fg',
            collapsed && 'justify-center',
          )}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {!collapsed ? t.admin.backWebsite : null}
        </a>
      </div>
    </div>
  );
}

function SidebarChrome({
  userLabel,
  children,
  collapsed,
  onClose,
  onToggleCollapse,
}: {
  userLabel: string;
  children: ReactNode;
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <div className="border-b border-sidebar-border px-3 py-4">
        <div className={cn('flex items-start gap-2', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed ? <Logo to={adminPath()} imgClassName="h-9 max-w-[140px]" /> : null}
          <div className="flex items-center gap-1">
            {onToggleCollapse ? (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-fg"
                onClick={onToggleCollapse}
                aria-label={collapsed ? t.admin.expandSidebar : t.admin.collapseSidebar}
                title={collapsed ? t.admin.expandSidebar : t.admin.collapseSidebar}
              >
                {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            ) : null}
            {onClose ? (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center text-sidebar-muted"
                onClick={onClose}
                aria-label={t.admin.close}
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
        {!collapsed ? (
          <>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t.admin.brand}
            </p>
            <p className="mt-1 truncate text-xs text-sidebar-muted">{userLabel}</p>
          </>
        ) : null}
      </div>
      {children}
    </>
  );
}

export function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, toggleLocale, dir } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  if (loading) return <LoadingState variant="page" />;
  if (!isAuthenticated) return <Navigate to={adminPath('login')} replace />;
  if (user?.role === 'CUSTOMER') return <Navigate to="/" replace />;

  const userLabel = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <div className="flex min-h-screen bg-background text-foreground" dir={dir}>
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-e border-sidebar-border bg-sidebar text-sidebar-fg transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <SidebarChrome
          userLabel={userLabel}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        >
          <SidebarNav collapsed={collapsed} />
        </SidebarChrome>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col admin-shell">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
              aria-label={t.admin.menu}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:inline-flex"
              aria-label={collapsed ? t.admin.expandSidebar : t.admin.collapseSidebar}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <Logo to={adminPath()} className="lg:hidden" imgClassName="h-8 max-w-[140px]" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {locale === 'ar' ? 'افاق الطاقة · Energy Horizon' : 'Energy Horizon · افاق الطاقة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-[11px] font-bold tracking-wider text-foreground transition hover:border-primary hover:text-primary"
            >
              {locale === 'en' ? 'ع' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-foreground transition hover:border-primary hover:text-primary"
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.admin.signOut}</span>
            </button>
          </div>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={t.admin.close}
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className={cn(
                'absolute top-0 flex h-full w-72 flex-col bg-sidebar text-sidebar-fg shadow-2xl',
                dir === 'rtl' ? 'right-0' : 'left-0',
              )}
            >
              <SidebarChrome userLabel={userLabel} onClose={() => setMobileOpen(false)}>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SidebarChrome>
            </aside>
          </div>
        ) : null}

        <div className="flex-1 overflow-x-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
