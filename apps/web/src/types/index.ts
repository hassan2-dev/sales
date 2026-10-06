export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  role: string;
  roleId: string;
  permissions: string[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number | string;
  currency: string;
  stock: number;
  status: string;
  availability: string;
  featured?: boolean;
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: { id: string; url: string; isPrimary?: boolean }[];
  documents?: {
    id: string;
    name: string;
    url: string;
    mimeType?: string | null;
    size?: number | null;
  }[];
  brand?: { id: string; name: string; slug: string } | null;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  specifications?: Record<string, unknown> | null;
  similar?: Product[];
  variants?: Product[];
  relatedFrom?: { relatedProduct: Product }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: string;
  parentId?: string | null;
  sortOrder?: number;
  parent?: Category | null;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  status?: string;
  sortOrder?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
  unitPrice?: number | string;
  lineTotal?: number | string;
}

export interface Cart {
  id?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal?: number | string;
  itemCount?: number;
}

export interface OrderStatusHistory {
  id: string;
  fromStatus?: string | null;
  toStatus: string;
  note?: string | null;
  createdAt: string;
  changedBy?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  subtotal?: number | string;
  discount?: number | string;
  shipping?: number | string;
  total: number | string;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  notes?: string | null;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  };
  items?: {
    id?: string;
    quantity: number;
    productName: string;
    sku: string;
    unitPrice?: number | string;
    lineTotal?: number | string;
    product?: { id?: string; slug?: string; name?: string; sku?: string } | null;
  }[];
  history?: OrderStatusHistory[];
  orderNotes?: {
    id: string;
    note: string;
    isInternal?: boolean;
    createdAt: string;
    user?: { firstName?: string; lastName?: string } | null;
  }[];
}

export interface QuoteRequest {
  id: string;
  quoteNumber: string;
  status: string;
  message?: string | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  quotedAmount?: number | string | null;
  validUntil?: string | null;
  createdAt?: string;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  } | null;
  items?: {
    id?: string;
    productId: string;
    quantity: number;
    product?: Product | null;
  }[];
  attachments?: { id: string; url: string; fileName?: string | null; name?: string | null }[];
  currency?: string;
  assignedTo?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export interface CmsService {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  status?: string;
  sortOrder?: number;
}

export interface CmsProject {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  coverImage?: string | null;
  imageUrl?: string | null;
  client?: string | null;
  location?: string | null;
  status?: string;
}

export interface CmsNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  author?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  status?: string;
  featured?: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  status?: string;
}

export interface Office {
  id: string;
  name: string;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  status?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority?: string;
  messages?: {
    id: string;
    message: string;
    createdAt: string;
    sender?: { firstName?: string; lastName?: string };
  }[];
}

export interface DashboardOverview {
  orders: { total: number; pending: number; today: number };
  products: { total: number; active: number; lowStock: number };
  quotes: { total: number; pending: number };
  tickets: { open: number };
  revenue: { monthTotal: number; currency: string };
  recentOrders: Order[];
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt?: string;
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
  } | null;
  _count?: { orders?: number; quotes?: number; tickets?: number };
}
