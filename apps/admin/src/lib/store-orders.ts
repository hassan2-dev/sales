import type { Order } from '@/types';

const KEY = 'eh_store_orders';

export type SavedStoreOrder = {
  id: string;
  orderNumber: string;
  email: string;
  total: number | string;
  currency: string;
  status: string;
  createdAt: string;
};

export function readSavedOrders(): SavedStoreOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedStoreOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoreOrder(order: Order) {
  const email = order.customer?.email?.trim().toLowerCase();
  if (!email || !order.id || !order.orderNumber) return;

  const next: SavedStoreOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    email,
    total: order.total,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
  };

  const existing = readSavedOrders().filter((o) => o.id !== next.id);
  localStorage.setItem(KEY, JSON.stringify([next, ...existing].slice(0, 40)));
}

export function rememberOrderEmail(email: string) {
  localStorage.setItem('eh_store_order_email', email.trim().toLowerCase());
}

export function readOrderEmail() {
  return localStorage.getItem('eh_store_order_email') || '';
}
