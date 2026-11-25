/** First admin screen this account is allowed to open. */
export function adminHomePath(user: { role: string; permissions?: string[] } | null | undefined) {
  const can = (code: string) =>
    user?.role === 'ADMIN' || (user?.permissions?.includes(code) ?? false);

  if (can('dashboard:read')) return '/';
  if (can('products:read')) return '/products';
  if (can('categories:read')) return '/categories';
  if (can('orders:read')) return '/orders';
  if (can('customers:read')) return '/customers';
  if (can('quotes:read')) return '/quotes';
  if (can('support:read')) return '/support';
  if (can('services:read')) return '/services';
  if (can('projects:read')) return '/projects';
  if (can('brands:read')) return '/brands';
  return '/';
}
