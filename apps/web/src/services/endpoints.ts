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
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get<AuthUser>('/auth/me'),
};

export const catalogApi = {
  products: (params?: Params) =>
    api.get<Paginated<Product>>('/products', { params: cleanParams(params) }),
  productBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`),
  productById: (id: string) => api.get<Product>(`/products/${id}`),
  createProduct: (data: Record<string, unknown>) => api.post<Product>('/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch<Product>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  categories: () => api.get<Category[]>('/categories'),
  categoryBySlug: (slug: string) => api.get<Category>(`/categories/slug/${slug}`),
  brands: () => api.get<Brand[]>('/brands'),
  brandBySlug: (slug: string) => api.get<Brand>(`/brands/slug/${slug}`),
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
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
  addNote: (id: string, note: string, isInternal = true) =>
    api.post(`/orders/${id}/notes`, { note, isInternal }),
};

export const quotesApi = {
  create: (data: Record<string, unknown>) => api.post<QuoteRequest>('/quotes', data),
  list: (params?: Params) =>
    api.get<Paginated<QuoteRequest> | QuoteRequest[]>('/quotes', { params: cleanParams(params) }),
  get: (id: string) => api.get<QuoteRequest>(`/quotes/${id}`),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch(`/quotes/${id}/status`, data),
  assign: (id: string, assignedToId: string) =>
    api.patch(`/quotes/${id}/assign`, { assignedToId }),
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
  orders: () => api.get('/dashboard/orders'),
  recentActivity: () => auditApi.list({ limit: 10 }),
};
