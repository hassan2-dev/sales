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
} from 'lucide-react';
import { useAuth } from '@/stores/auth-context';
import { LoadingState } from '@/components/ui/States';
import { adminPath, SITE_URL } from '@/lib/urls';
import { cn } from '@/lib/cn';

const nav = [
  { to: '', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: 'products', label: 'Products', icon: Package },
  { to: 'orders', label: 'Orders', icon: ShoppingBag },
  { to: 'customers', label: 'Customers', icon: Users },
  { to: 'quotes', label: 'Quotes', icon: FileText },
  { to: 'support', label: 'Support', icon: LifeBuoy },
  { to: 'services', label: 'Services', icon: Briefcase },
  { to: 'projects', label: 'Projects', icon: FolderKanban },
  { to: 'news', label: 'News', icon: Newspaper },
  { to: 'brands', label: 'Brands', icon: Award },
  { to: 'pages', label: 'Pages', icon: File },
  { to: 'offices', label: 'Offices', icon: Building2 },
  { to: 'users', label: 'Users', icon: UserCog },
  { to: 'audit-logs', label: 'Audit logs', icon: ScrollText },
  { to: 'settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <LoadingState label="Checking session…" />;
  if (!isAuthenticated) return <Navigate to={adminPath('login')} replace />;

  return (
    <div className="flex min-h-screen bg-page text-fg">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto bg-[var(--header)] text-white lg:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <img src="/logo.png" alt="AT" className="h-10 w-auto object-contain" />
          <p className="mt-3 truncate text-xs text-white/45">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2 text-[13px]">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to || 'home'}
                to={adminPath(item.to)}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-sm px-3 py-2 text-white/65 transition hover:bg-white/5 hover:text-white',
                    isActive && 'bg-white/10 font-semibold text-white',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <a
            href={SITE_URL}
            className="mt-1 block px-3 py-1 text-xs text-white/35 transition hover:text-white/70"
          >
            ← Website
          </a>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-elevated px-4 py-3 lg:hidden">
          <img src="/logo.png" alt="AT" className="h-8 w-auto object-contain" />
          <button
            type="button"
            className="text-sm font-medium text-accent"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </header>
        <div className="flex-1 overflow-x-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
