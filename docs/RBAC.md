# RBAC

## Roles

| Code | Description |
|------|-------------|
| `ADMIN` | Full system access (permission bypass) |
| `EMPLOYEE` | Operational access via assigned permissions |
| `CUSTOMER` | Reserved for future customer portal |

## Permission model

Permissions are codes like `products:create`, stored in `Permission` and linked via `RolePermission`.

Modules include: `products`, `categories`, `brands`, `inventory`, `orders`, `quotes`, `customers`, `media`, `pages`, `services`, `projects`, `news`, `offices`, `support`, `users`, `roles`, `audit`, `dashboard`, `notifications`

Typical actions: `read`, `create`, `update`, `delete` (plus domain actions like `assign`).

## Enforcement

1. **JwtAuthGuard** — global; skips routes marked `@Public()`
2. **PermissionsGuard** — requires `@RequirePermissions('orders:update')` etc.
3. ADMIN role short-circuits permission checks
4. Frontend route guards are UX only — API always validates

## Employee capabilities (seed defaults)

- Products, inventory, media: full CRUD
- Orders: read + status update + notes
- Customers, quotes, support: operational
- CMS: services, news, projects, pages, brands, offices
- No user/role administration
- Dashboard read allowed

## Audit

Sensitive mutations write `AuditLog` entries (`PRODUCT_CREATED`, `ORDER_STATUS_CHANGED`, `TICKET_ASSIGNED`, …) with user, IP, and metadata.
