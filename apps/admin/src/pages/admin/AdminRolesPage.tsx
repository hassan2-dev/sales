import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/admin/FormStudio';
import { useI18n } from '@/i18n/i18n-context';
import { cn } from '@/lib/cn';
import { rolesApi, type StaffPermission, type StaffRole } from '@/services/endpoints';

const ROLE_ORDER = ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] as const;

const MODULE_LABEL: Record<string, keyof ReturnType<typeof useI18n>['t']['admin']> = {
  products: 'moduleProducts',
  categories: 'moduleCategories',
  brands: 'moduleBrands',
  inventory: 'moduleInventory',
  orders: 'moduleOrders',
  quotes: 'moduleQuotes',
  customers: 'moduleCustomers',
  media: 'moduleMedia',
  pages: 'modulePages',
  services: 'moduleServices',
  projects: 'moduleProjects',
  news: 'moduleNews',
  offices: 'moduleOffices',
  support: 'moduleSupport',
  users: 'moduleUsers',
  roles: 'moduleRoles',
  audit: 'moduleAudit',
  dashboard: 'moduleDashboard',
  notifications: 'moduleNotifications',
  settings: 'moduleSettings',
};

function roleCopy(code: string, t: ReturnType<typeof useI18n>['t']) {
  if (code === 'ADMIN') return { title: t.admin.roleAdmin, description: t.admin.roleAdminDesc };
  if (code === 'CUSTOMER') return { title: t.admin.roleCustomer, description: t.admin.roleCustomerDesc };
  return { title: t.admin.roleEmployee, description: t.admin.roleEmployeeDesc };
}

function actionLabel(code: string, t: ReturnType<typeof useI18n>['t']) {
  const action = code.split(':')[1];
  if (action === 'read') return t.admin.permRead;
  if (action === 'create') return t.admin.permCreate;
  if (action === 'delete') return t.admin.permDelete;
  if (action === 'reply') return t.admin.permReply;
  return t.admin.permUpdate;
}

export function AdminRolesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const roles = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => (await rolesApi.list()).data,
  });
  const catalog = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => (await rolesApi.permissions()).data,
  });
  const [activeId, setActiveId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const ordered = useMemo(() => {
    const list = roles.data ?? [];
    return [...list].sort(
      (a, b) => ROLE_ORDER.indexOf(a.code as (typeof ROLE_ORDER)[number]) - ROLE_ORDER.indexOf(b.code as (typeof ROLE_ORDER)[number]),
    );
  }, [roles.data]);

  const active = ordered.find((role) => role.id === activeId) ?? ordered[0];
  const locked = active?.code !== 'EMPLOYEE';

  useEffect(() => {
    if (!active) return;
    setActiveId(active.id);
    setSelected(active.permissions.map((permission) => permission.id));
  }, [active]);

  const groups = useMemo(() => {
    const map = new Map<string, StaffPermission[]>();
    for (const permission of catalog.data ?? []) {
      const bucket = map.get(permission.module) ?? [];
      bucket.push(permission);
      map.set(permission.module, bucket);
    }
    return [...map.entries()];
  }, [catalog.data]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleModule(items: StaffPermission[], on: boolean) {
    const ids = items.map((item) => item.id);
    setSelected((current) => {
      const rest = current.filter((id) => !ids.includes(id));
      return on ? [...rest, ...ids] : rest;
    });
  }

  async function save(role: StaffRole) {
    setSaving(true);
    try {
      await rolesApi.updatePermissions(role.id, selected);
      toast.success(t.admin.permissionsSaved);
      await qc.invalidateQueries({ queryKey: ['admin-roles'] });
    } catch {
      toast.error(t.admin.permissionsFailed);
    } finally {
      setSaving(false);
    }
  }

  if (roles.isLoading || catalog.isLoading) return <LoadingState variant="page" />;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={t.admin.groupSystem} title={t.admin.roles} description={t.admin.rolesHint} />

      <div className="grid gap-3 lg:grid-cols-3">
        {ordered.map((role) => {
          const copy = roleCopy(role.code, t);
          const on = role.id === active?.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveId(role.id)}
              className={cn(
                'rounded-2xl border bg-card p-4 text-start transition',
                on ? 'border-[#0070c0] ring-2 ring-[#0070c0]/20' : 'border-border hover:border-[#0070c0]/40',
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1f3a] text-white">
                  <Shield className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {role.userCount} {t.admin.rolePeople}
                </span>
              </span>
              <span className="mt-3 block text-base font-bold text-fg">{copy.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{copy.description}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{roleCopy(active.code, t).title}</CardTitle>
              <CardDescription>
                {locked
                  ? t.admin.roleLocked
                  : `${selected.length} / ${catalog.data?.length ?? 0}`}
              </CardDescription>
            </div>
            {locked ? null : (
              <Button disabled={saving} onClick={() => void save(active)}>
                {saving ? t.common.loading : t.admin.savePermissions}
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map(([module, items]) => {
              const labelKey = MODULE_LABEL[module];
              const title = labelKey ? t.admin[labelKey] : module;
              const allOn = items.every((item) => selected.includes(item.id));
              return (
                <div key={module} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">{title}</p>
                    {locked ? null : (
                      <button
                        type="button"
                        className="text-xs font-semibold text-accent"
                        onClick={() => toggleModule(items, !allOn)}
                      >
                        {allOn ? t.admin.clearAll : t.admin.selectAll}
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#0070c0]"
                          checked={selected.includes(item.id)}
                          disabled={locked}
                          onChange={() => toggle(item.id)}
                        />
                        <span>{actionLabel(item.code, t)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
