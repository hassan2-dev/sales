import { api } from './api';
import type {
  AuthUser,
  Brand,
  Cart,
  Category,
  CmsNews,
  CmsPage,
  CmsProject,
  CmsService,
  SiteCommerceSettings,
  Customer,
  DashboardOverview,
  Office,
  Order,
  Paginated,
  Product,
  QuoteRequest,
  SupportTicket,
} from '@/types';

type Params = Record<string, string | number | boolean | undefined | null>;

function cleanParams(params?: Params) {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    }),
  requestOtp: (phone: string) =>
    api.post<{ ok: boolean; phone: string; expiresInSec: number; devCode?: string }>(
      '/auth/otp/request',
      { phone },
    ),
  verifyOtp: (data: { phone: string; code: string; firstName: string; lastName: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>(
      '/auth/otp/verify',
      data,
    ),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get<AuthUser>('/auth/me'),
};

export const catalogApi = {
  products: (params?: Params) =>
    api.get<Paginated<Product>>('/products', { params: cleanParams(params) }),
  productsAdmin: (params?: Params) =>
    api.get<Paginated<Product>>('/products/admin', { params: cleanParams(params) }),
  productBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`),
  productById: (id: string) => api.get<Product>(`/products/${id}`),
  createProduct: (data: Record<string, unknown>) => api.post<Product>('/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch<Product>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  addProductImage: (
    id: string,
    data: { url: string; alt?: string; isPrimary?: boolean; sortOrder?: number },
  ) => api.post(`/products/${id}/images`, data),
  removeProductImage: (id: string, imageId: string) =>
    api.delete(`/products/${id}/images/${imageId}`),
  addProductDocument: (
    id: string,
    data: { name: string; url: string; mimeType?: string; size?: number },
  ) => api.post(`/products/${id}/documents`, data),
  removeProductDocument: (id: string, documentId: string) =>
    api.delete(`/products/${id}/documents/${documentId}`),
  categories: () => api.get<Category[]>('/categories'),
  categoriesAdmin: () => api.get<Category[]>('/categories/admin/all'),
  categoryBySlug: (slug: string) => api.get<Category>(`/categories/slug/${slug}`),
  createCategory: (data: Record<string, unknown>) => api.post<Category>('/categories', data),
  updateCategory: (id: string, data: Record<string, unknown>) =>
    api.patch<Category>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
  brands: () => api.get<Brand[]>('/brands'),
  brandBySlug: (slug: string) => api.get<Brand>(`/brands/slug/${slug}`),
};

export const mediaApi = {
  upload: (file: File, alt?: string) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{
      id: string;
      url: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
    }>('/media/upload', form, {
      params: alt ? { alt } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            if (headers && typeof (headers as { delete?: (k: string) => void }).delete === 'function') {
              (headers as { delete: (k: string) => void }).delete('Content-Type');
            } else if (headers) {
              delete (headers as Record<string, unknown>)['Content-Type'];
            }
          }
          return data;
        },
      ],
    });
  },
};

export const cartApi = {
  get: () => api.get<Cart>('/cart'),
  addItem: (productId: string, quantity: number) =>
    api.post<Cart>('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

export const ordersApi = {
  checkout: (data: Record<string, unknown>) => api.post<Order>('/orders/checkout', data),
  create: (data: Record<string, unknown>) => api.post<Order>('/orders', data),
  list: (params?: Params) => api.get<Paginated<Order>>('/orders', { params: cleanParams(params) }),
  get: (id: string) => api.get<Order>(`/orders/${id}`),
  track: (email: string, orderNumber: string) =>
    api.get<Order>('/orders/track', { params: { email, orderNumber } }),
  mine: () => api.get<{ data: Order[] }>('/orders/me'),
  myOrder: (id: string) => api.get<Order>(`/orders/me/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
  addNote: (id: string, note: string, isInternal = true) =>
    api.post(`/orders/${id}/notes`, { note, isInternal }),
};

export const quotesApi = {
  create: (data: Record<string, unknown>) => api.post<QuoteRequest>('/quotes', data),
  mine: () => api.get<{ data: QuoteRequest[] }>('/quotes/me'),
  list: (params?: Params) =>
    api.get<Paginated<QuoteRequest> | QuoteRequest[]>('/quotes', { params: cleanParams(params) }),
  get: (id: string) => api.get<QuoteRequest>(`/quotes/${id}`),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch(`/quotes/${id}/status`, data),
  assign: (id: string, assignedToId: string) =>
    api.patch(`/quotes/${id}/assign`, { assignedToId }),
};

export const settingsApi = {
  commerce: () => api.get<SiteCommerceSettings>('/settings/commerce'),
  commerceAdmin: () => api.get<SiteCommerceSettings & { id?: string; updatedAt?: string }>(
    '/settings/commerce/admin',
  ),
  updateCommerce: (data: Partial<SiteCommerceSettings>) => api.patch('/settings/commerce', data),
};

export const cmsApi = {
  pages: () => api.get<CmsPage[]>('/pages'),
  pageBySlug: (slug: string) => api.get<CmsPage>(`/pages/slug/${slug}`),
  services: () => api.get<CmsService[]>('/services'),
  serviceBySlug: (slug: string) => api.get<CmsService>(`/services/slug/${slug}`),
  projects: () => api.get<CmsProject[]>('/projects'),
  projectBySlug: (slug: string) => api.get<CmsProject>(`/projects/slug/${slug}`),
  news: (params?: Params) =>
    api.get<CmsNews[] | Paginated<CmsNews>>('/news', { params: cleanParams(params) }),
  newsBySlug: (slug: string) => api.get<CmsNews>(`/news/slug/${slug}`),
  offices: () => api.get<Office[]>('/offices'),
  brands: () => api.get<Brand[]>('/brands'),
};

export const adminCmsApi = {
  services: () => api.get<CmsService[]>('/services/admin/all'),
  updateService: (id: string, data: Record<string, unknown>) => api.patch(`/services/${id}`, data),
  createService: (data: Record<string, unknown>) => api.post('/services', data),
  createProject: (data: Record<string, unknown>) => api.post('/projects', data),
  createNews: (data: Record<string, unknown>) => api.post('/news', data),
  createBrand: (data: Record<string, unknown>) => api.post('/brands', data),
  createPage: (data: Record<string, unknown>) => api.post('/pages', data),
  createOffice: (data: Record<string, unknown>) => api.post('/offices', data),
  createCategory: (data: Record<string, unknown>) => api.post('/categories', data),
};

export const supportApi = {
  create: (data: Record<string, unknown>) => api.post<SupportTicket>('/tickets', data),
  list: (params?: Params) =>
    api.get<Paginated<SupportTicket> | SupportTicket[]>('/tickets', {
      params: cleanParams(params),
    }),
  get: (id: string) => api.get<SupportTicket>(`/tickets/${id}`),
  reply: (id: string, message: string) => api.post(`/tickets/${id}/messages`, { message }),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/tickets/${id}`, data),
};

export const customersApi = {
  me: () => api.get<Customer>('/customers/me'),
  updateMe: (data: Record<string, unknown>) => api.patch<Customer>('/customers/me', data),
  list: (params?: Params) =>
    api.get<Paginated<Customer> | Customer[]>('/customers', { params: cleanParams(params) }),
  get: (id: string) => api.get<Customer>(`/customers/${id}`),
  history: (id: string) => api.get(`/customers/${id}/history`),
};

export const usersApi = {
  list: (params?: Params) => api.get('/users', { params: cleanParams(params) }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
};

export const auditApi = {
  list: (params?: Params) => api.get('/audit', { params: cleanParams(params) }),
};

export const dashboardApi = {
  overview: () => api.get<DashboardOverview>('/dashboard/overview'),
  sales: (_days = 30) => api.get('/dashboard/sales'),
  salesTrend: (days = 30) =>
    api.get<{
      days: number;
      currency: string;
      series: { date: string; revenue: number; orders: number }[];
    }>('/dashboard/sales-trend', { params: { days } }),
  orders: () => api.get('/dashboard/orders'),
  recentActivity: () => auditApi.list({ limit: 10 }),
};
