import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, EmptyState, Pagination } from '@/components/ui/States';
import { useAuth } from '@/stores/auth-context';
import {
  authApi,
  catalogApi,
  customersApi,
  dashboardApi,
  ordersApi,
  quotesApi,
  supportApi,
  cmsApi,
  adminCmsApi,
  usersApi,
  auditApi,
} from '@/services/endpoints';
import { formatMoney } from '@/lib/cn';
import { adminPath, SITE_URL } from '@/lib/urls';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@energy-horizon.net');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    navigate(adminPath());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate(adminPath());
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-4">
      <Seo title="Admin login" path={adminPath('login')} />
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-elevated p-8 shadow-xl border border-line">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="AT" className="mb-4 h-14 w-auto rounded-md bg-brand object-contain p-2" />
          <h1 className="text-xl font-bold text-fg">Staff dashboard</h1>
          <p className="text-sm text-muted">Energy Horizon · افاق الطاقة</p>
        </div>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-center text-xs text-muted">
          <a href={SITE_URL}>← Back to website</a>
        </p>
      </form>
    </div>
  );
}

export function AdminDashboardPage() {
  const overview = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => (await dashboardApi.overview()).data,
  });
  const sales = useQuery({
    queryKey: ['dashboard-sales'],
    queryFn: async () =>
      (await dashboardApi.sales()).data as {
        monthOrders: number;
        monthRevenue: number;
        completedOrders: number;
        completedRevenue: number;
        currency: string;
      },
  });
  const orderStats = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () =>
      (await dashboardApi.orders()).data as { byStatus: { status: string; count: number }[] },
  });
  const activity = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await dashboardApi.recentActivity();
      const data = res.data as unknown;
      if (Array.isArray(data)) return data as { id: string; action: string; entity: string; createdAt: string }[];
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: { id: string; action: string; entity: string; createdAt: string }[] }).data;
      }
      return [];
    },
  });

  const cards = overview.data
    ? [
        {
          label: 'Month revenue',
          value: formatMoney(overview.data.revenue.monthTotal, overview.data.revenue.currency),
        },
        { label: 'Orders', value: overview.data.orders.total },
        { label: 'Pending orders', value: overview.data.orders.pending },
        { label: 'Orders today', value: overview.data.orders.today },
        { label: 'Products', value: overview.data.products.total },
        { label: 'Active products', value: overview.data.products.active },
        { label: 'Low stock', value: overview.data.products.lowStock },
        { label: 'Quote requests', value: overview.data.quotes.total },
        { label: 'Pending quotes', value: overview.data.quotes.pending },
        { label: 'Open tickets', value: overview.data.tickets.open },
      ]
    : [];

  const maxStatus = Math.max(1, ...(orderStats.data?.byStatus ?? []).map((s) => s.count));

  return (
    <div className="space-y-8">
      <Seo title="Admin dashboard" path="/admin" />
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Executive overview</h1>
        <p className="mt-1 text-sm text-navy/60">Business state at a glance</p>
      </div>
      {overview.isLoading ? <LoadingState /> : null}
      {overview.isError ? (
        <p className="text-sm text-red-700">Could not load dashboard. Check API auth permissions.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-5 ring-1 ring-navy/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-navy">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-5 ring-1 ring-navy/5">
          <h2 className="font-display text-lg font-semibold">Sales this month</h2>
          {sales.isLoading ? <LoadingState className="py-8" /> : null}
          {sales.data ? (
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-navy/45">Orders</dt>
                <dd className="font-display text-2xl font-bold">{sales.data.monthOrders}</dd>
              </div>
              <div>
                <dt className="text-navy/45">Revenue</dt>
                <dd className="font-display text-2xl font-bold">
                  {formatMoney(sales.data.monthRevenue, sales.data.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-navy/45">Completed</dt>
                <dd className="font-display text-2xl font-bold">{sales.data.completedOrders}</dd>
              </div>
              <div>
                <dt className="text-navy/45">Completed revenue</dt>
                <dd className="font-display text-2xl font-bold">
                  {formatMoney(sales.data.completedRevenue, sales.data.currency)}
                </dd>
              </div>
            </dl>
          ) : null}
          <div className="mt-6 flex h-32 items-end gap-2">
            {(orderStats.data?.byStatus ?? []).map((s) => (
              <div key={s.status} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full bg-steel/80"
                  style={{ height: `${(s.count / maxStatus) * 100}%`, minHeight: s.count ? 4 : 0 }}
                  title={`${s.status}: ${s.count}`}
                />
                <span className="truncate text-[10px] text-navy/45">{s.status.slice(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 ring-1 ring-navy/5">
          <h2 className="font-display text-lg font-semibold">Recent orders & activity</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(overview.data?.recentOrders ?? []).slice(0, 6).map((o) => (
              <li key={o.id} className="flex justify-between gap-3 border-b border-navy/5 pb-2">
                <Link to={adminPath(`orders/${o.id}`)} className="text-steel hover:underline">
                  {o.orderNumber}
                </Link>
                <span className="text-navy/45">{formatMoney(o.total, o.currency)}</span>
              </li>
            ))}
            {(activity.data ?? []).slice(0, 4).map((a) => (
              <li key={a.id} className="flex justify-between gap-3 border-b border-navy/5 pb-2">
                <span>
                  {a.action} · {a.entity}
                </span>
                <span className="text-navy/45">{new Date(a.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
            {!overview.isLoading && !(overview.data?.recentOrders ?? []).length && !(activity.data ?? []).length ? (
              <li className="text-navy/50">No recent activity yet</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin-products', page],
    queryFn: async () => (await catalogApi.products({ page, limit: 20 })).data,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-navy">Products</h1>
        <Link to={adminPath("products/new")}><Button>New product</Button></Link>
      </div>
      {query.isLoading ? <LoadingState /> : null}
      <div className="overflow-x-auto bg-white ring-1 ring-navy/5">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-navy/10 bg-navy/5 text-xs uppercase text-navy/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                <td className="px-4 py-3">
                  <Link to={adminPath(`products/${p.id}`)} className="font-medium text-steel hover:underline">{p.name}</Link>
                </td>
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{formatMoney(p.price, p.currency)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={query.data?.meta.page ?? 1} totalPages={query.data?.meta.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  currency: z.string(),
});

type ProductForm = z.infer<typeof productSchema>;

export function AdminProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = useQuery({
    queryKey: ['admin-product', id],
    enabled: !isNew,
    queryFn: async () => (await catalogApi.productById(id!)).data,
  });

  const form = useForm<ProductForm>({
    // zod v4 + RHF resolver typing can drift; cast keeps runtime validation
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      shortDescription: '',
      description: '',
      status: 'DRAFT',
      currency: 'USD',
    },
    values: existing.data
      ? {
          name: existing.data.name,
          sku: existing.data.sku,
          price: Number(existing.data.price),
          stock: existing.data.stock,
          shortDescription: existing.data.shortDescription || '',
          description: existing.data.description || '',
          status: (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(existing.data.status)
            ? existing.data.status
            : 'DRAFT') as ProductForm['status'],
          currency: existing.data.currency,
        }
      : undefined,
  });

  async function onSubmit(values: ProductForm) {
    try {
      if (isNew) {
        await catalogApi.createProduct(values);
        toast.success('Product created');
      } else {
        await catalogApi.updateProduct(id!, values);
        toast.success('Product updated');
      }
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate(adminPath('products'));
    } catch {
      toast.error('Save failed');
    }
  }

  if (!isNew && existing.isLoading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">{isNew ? 'New product' : 'Edit product'}</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 bg-white p-6 ring-1 ring-navy/5">
        <Input placeholder="Name" {...form.register('name')} />
        <Input placeholder="SKU" {...form.register('sku')} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="number"
            step="0.01"
            placeholder="Price"
            {...form.register('price', { valueAsNumber: true })}
          />
          <Input type="number" placeholder="Stock" {...form.register('stock', { valueAsNumber: true })} />
          <Input placeholder="Currency" {...form.register('currency')} />
        </div>
        <Select {...form.register('status')}>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Textarea placeholder="Short description" {...form.register('shortDescription')} />
        <Textarea placeholder="Description" {...form.register('description')} />
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: async () => (await ordersApi.list({ page, limit: 20 })).data,
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Orders</h1>
      {query.isLoading ? <LoadingState /> : null}
      <div className="overflow-x-auto bg-white ring-1 ring-navy/5">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-navy/5 text-xs uppercase text-navy/50">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data ?? []).map((o) => (
              <tr key={o.id} className="border-b border-navy/5">
                <td className="px-4 py-3"><Link className="text-steel" to={adminPath(`orders/${o.id}`)}>{o.orderNumber}</Link></td>
                <td className="px-4 py-3">{o.customer?.email}</td>
                <td className="px-4 py-3">{formatMoney(o.total, o.currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={query.data?.meta.page ?? 1} totalPages={query.data?.meta.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const order = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await ordersApi.get(id)).data,
  });
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  if (order.isLoading) return <LoadingState />;
  if (!order.data) return <EmptyState title="Order not found" />;

  async function saveStatus() {
    try {
      await ordersApi.updateStatus(id, status || order.data!.status, note || undefined);
      toast.success('Status updated');
      await qc.invalidateQueries({ queryKey: ['admin-order', id] });
    } catch {
      toast.error('Update failed');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Order {order.data.orderNumber}</h1>
      <StatusBadge status={order.data.status} />
      <div className="bg-white p-5 ring-1 ring-navy/5">
        <p className="text-sm">{order.data.customer?.firstName} {order.data.customer?.lastName} · {order.data.customer?.email}</p>
        <p className="mt-2 font-semibold">{formatMoney(order.data.total, order.data.currency)}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {(order.data.items ?? []).map((i, idx) => (
            <li key={idx}>{i.quantity} × {i.productName} ({i.sku})</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3 bg-white p-5 ring-1 ring-navy/5">
        <Select value={status || order.data.status} onChange={(e) => setStatus(e.target.value)}>
          {['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Input placeholder="Internal note" value={note} onChange={(e) => setNote(e.target.value)} className="max-w-xs" />
        <Button onClick={() => void saveStatus()}>Update status</Button>
      </div>
    </div>
  );
}

function AdminListPage({
  title,
  queryKey,
  fetcher,
  columns,
  newPath,
}: {
  title: string;
  queryKey: string;
  fetcher: () => Promise<{ data: unknown }>;
  columns: (row: Record<string, unknown>) => React.ReactNode;
  newPath?: string;
}) {
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetcher();
      const data = res.data as unknown;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data) return (data as { data: unknown[] }).data;
      return [];
    },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
        {newPath ? <Link to={newPath}><Button>Create</Button></Link> : null}
      </div>
      {query.isLoading ? <LoadingState /> : null}
      <div className="space-y-2">
        {(query.data as Record<string, unknown>[] | undefined)?.map((row, i) => (
          <div key={String(row.id ?? i)} className="bg-white p-4 ring-1 ring-navy/5">
            {columns(row)}
          </div>
        ))}
      </div>
      {!query.isLoading && !(query.data as unknown[])?.length ? <EmptyState title={`No ${title.toLowerCase()} yet`} /> : null}
    </div>
  );
}

export function AdminCustomersPage() {
  return (
    <AdminListPage
      title="Customers"
      queryKey="admin-customers"
      fetcher={() => customersApi.list()}
      columns={(row) => (
        <Link to={adminPath(`customers/${row.id}`)} className="font-medium text-steel">
          {String(row.firstName)} {String(row.lastName)} · {String(row.email)}
        </Link>
      )}
    />
  );
}

export function AdminCustomerDetailPage() {
  const { id = '' } = useParams();
  const customer = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => (await customersApi.get(id)).data,
  });
  if (customer.isLoading) return <LoadingState />;
  if (!customer.data) return <EmptyState title="Customer not found" />;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-navy">
        {customer.data.firstName} {customer.data.lastName}
      </h1>
      <p className="text-sm text-navy/70">{customer.data.email}</p>
      <p className="text-sm">{customer.data.company || ''}</p>
    </div>
  );
}

export function AdminQuotesPage() {
  return (
    <AdminListPage
      title="Quote requests"
      queryKey="admin-quotes"
      fetcher={() => quotesApi.list()}
      columns={(row) => (
        <Link to={adminPath(`quotes/${row.id}`)} className="flex justify-between">
          <span className="font-medium text-steel">{String(row.quoteNumber)}</span>
          <StatusBadge status={String(row.status)} />
        </Link>
      )}
    />
  );
}

export function AdminQuoteDetailPage() {
  const { id = '' } = useParams();
  const quote = useQuery({
    queryKey: ['admin-quote', id],
    queryFn: async () => (await quotesApi.get(id)).data,
  });
  if (quote.isLoading) return <LoadingState />;
  if (!quote.data) return <EmptyState title="Quote not found" />;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">{quote.data.quoteNumber}</h1>
      <StatusBadge status={quote.data.status} />
      <p className="text-sm whitespace-pre-wrap">{quote.data.message || ''}</p>
    </div>
  );
}

export function AdminSupportPage() {
  return (
    <AdminListPage
      title="Support tickets"
      queryKey="admin-tickets"
      fetcher={() => supportApi.list()}
      columns={(row) => (
        <Link to={adminPath(`support/${row.id}`)} className="flex justify-between gap-3">
          <span className="font-medium text-steel">{String(row.ticketNumber)} — {String(row.subject)}</span>
          <StatusBadge status={String(row.status)} />
        </Link>
      )}
    />
  );
}

export function AdminSupportDetailPage() {
  const { id = '' } = useParams();
  const [message, setMessage] = useState('');
  const qc = useQueryClient();
  const ticket = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: async () => (await supportApi.get(id)).data as {
      ticketNumber: string;
      subject: string;
      status: string;
      description: string;
      messages?: { id: string; message: string; createdAt: string; sender?: { firstName: string } }[];
    },
  });

  async function reply() {
    try {
      await supportApi.reply(id, message);
      setMessage('');
      toast.success('Reply sent');
      await qc.invalidateQueries({ queryKey: ['admin-ticket', id] });
    } catch {
      toast.error('Reply failed');
    }
  }

  if (ticket.isLoading) return <LoadingState />;
  if (!ticket.data) return <EmptyState title="Ticket not found" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{ticket.data.ticketNumber}</h1>
      <p className="font-medium">{ticket.data.subject}</p>
      <StatusBadge status={ticket.data.status} />
      <p className="text-sm text-navy/70">{ticket.data.description}</p>
      <div className="space-y-3">
        {(ticket.data.messages ?? []).map((m) => (
          <div key={m.id} className="bg-white p-3 text-sm ring-1 ring-navy/5">
            <p className="text-xs text-navy/45">{m.sender?.firstName} · {new Date(m.createdAt).toLocaleString()}</p>
            <p className="mt-1">{m.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Reply…" />
        <Button onClick={() => void reply()}>Send</Button>
      </div>
    </div>
  );
}

function CmsCrudPage({
  title,
  listKey,
  listFn,
  createFn,
  fields,
}: {
  title: string;
  listKey: string;
  listFn: () => Promise<{ data: unknown }>;
  createFn: (data: Record<string, string>) => Promise<unknown>;
  fields: string[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const list = useQuery({
    queryKey: [listKey],
    queryFn: async () => {
      const res = await listFn();
      return Array.isArray(res.data) ? res.data : (res.data as { data: unknown[] }).data ?? [];
    },
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createFn(form);
      toast.success('Created');
      setForm({});
      await qc.invalidateQueries({ queryKey: [listKey] });
    } catch {
      toast.error('Create failed');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
      <form onSubmit={create} className="grid gap-2 bg-white p-4 ring-1 ring-navy/5 md:grid-cols-2">
        {fields.map((f) => (
          <Input
            key={f}
            placeholder={f}
            value={form[f] || ''}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            required={f === 'name' || f === 'title'}
          />
        ))}
        <Button type="submit" className="md:col-span-2">Create</Button>
      </form>
      {list.isLoading ? <LoadingState /> : null}
      <div className="space-y-2">
        {(list.data as Record<string, unknown>[] | undefined)?.map((row) => (
          <div key={String(row.id)} className="bg-white p-3 text-sm ring-1 ring-navy/5">
            {String(row.name || row.title)} · {String(row.slug || '')} · <StatusBadge status={String(row.status || 'DRAFT')} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminServicesPage() {
  return (
    <CmsCrudPage
      title="Services"
      listKey="admin-services"
      listFn={() => cmsApi.services()}
      createFn={(d) => adminCmsApi.createService({ ...d, status: 'PUBLISHED', slug: d.name?.toLowerCase().replace(/\s+/g, '-') })}
      fields={['name', 'shortDescription', 'description']}
    />
  );
}

export function AdminProjectsPage() {
  return (
    <CmsCrudPage
      title="Projects"
      listKey="admin-projects"
      listFn={() => cmsApi.projects()}
      createFn={(d) => adminCmsApi.createProject({ ...d, title: d.title || d.name, status: 'PUBLISHED', slug: (d.title || d.name || '').toLowerCase().replace(/\s+/g, '-') })}
      fields={['title', 'shortDescription', 'description']}
    />
  );
}

export function AdminNewsPage() {
  return (
    <CmsCrudPage
      title="News"
      listKey="admin-news"
      listFn={() => cmsApi.news()}
      createFn={(d) => adminCmsApi.createNews({ ...d, title: d.title, status: 'PUBLISHED', slug: d.title.toLowerCase().replace(/\s+/g, '-'), publishedAt: new Date().toISOString() })}
      fields={['title', 'excerpt', 'content', 'author']}
    />
  );
}

export function AdminBrandsPage() {
  return (
    <CmsCrudPage
      title="Brands"
      listKey="admin-brands"
      listFn={() => cmsApi.brands()}
      createFn={(d) => adminCmsApi.createBrand({ ...d, status: 'PUBLISHED', slug: d.name.toLowerCase().replace(/\s+/g, '-') })}
      fields={['name', 'description', 'website']}
    />
  );
}

export function AdminPagesPage() {
  return (
    <CmsCrudPage
      title="Pages"
      listKey="admin-pages"
      listFn={() => cmsApi.pages()}
      createFn={(d) => adminCmsApi.createPage({ ...d, title: d.title, status: 'PUBLISHED', slug: d.title.toLowerCase().replace(/\s+/g, '-') })}
      fields={['title', 'excerpt', 'content']}
    />
  );
}

export function AdminOfficesPage() {
  return (
    <CmsCrudPage
      title="Offices"
      listKey="admin-offices"
      listFn={() => cmsApi.offices()}
      createFn={(d) => adminCmsApi.createOffice({ ...d, status: 'PUBLISHED' })}
      fields={['name', 'city', 'phone', 'contactPerson', 'email']}
    />
  );
}

export function AdminUsersPage() {
  return (
    <AdminListPage
      title="Users"
      queryKey="admin-users"
      fetcher={() => usersApi.list()}
      columns={(row) => (
        <span>{String(row.email)} · {String((row.role as { code?: string })?.code || row.role || '')}</span>
      )}
    />
  );
}

export function AdminAuditPage() {
  return (
    <AdminListPage
      title="Audit logs"
      queryKey="admin-audit"
      fetcher={() => auditApi.list()}
      columns={(row) => (
        <span className="text-sm">{String(row.action)} · {String(row.entity)} · {new Date(String(row.createdAt)).toLocaleString()}</span>
      )}
    />
  );
}

export function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-navy">Settings</h1>
      <p className="text-sm text-navy/70">
        Company settings are stored via `CompanySetting` in the API. Configure environment variables for JWT, storage, and CORS in production.
      </p>
      <Button onClick={() => void authApi.me().then(() => toast.success('Session valid')).catch(() => toast.error('Session invalid'))}>
        Validate session
      </Button>
    </div>
  );
}
