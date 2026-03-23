# Ceramic Admin Dashboard

## Architecture
Next.js 14 App Router. Admin-only access. Server-side auth check in root layout redirects non-admins.

## Key Patterns

### Layout
`DashboardShell` wraps all pages: persistent sidebar (collapsible) + top header bar.
Sidebar nav: Dashboard, Products, Orders, Customers, Categories, Reviews, Analytics.

### Auth
Admin-only. Login page at `/login`. Root layout checks `role === "ADMIN"`:
- Not logged in → redirect to `/login`
- Logged in but not admin → "Access Denied" page
Uses same NextAuth + backend JWT flow as the storefront.

### Data Tables
Use `DataTable` component built on `@tanstack/react-table`:
- Sortable columns
- Search/filter
- Pagination (server-side)
- Row actions (edit, delete, view)

### Forms
React Hook Form + Zod resolvers. Schemas from `@ceramic/utils`:
```typescript
const form = useForm({ resolver: zodResolver(createProductSchema) });
```

### Mutations
Fetch POST/PATCH/DELETE via `lib/api.ts`. Show toast on success/error.

### Image Uploads
`ImageUploader` component:
1. Drag-and-drop zone
2. Preview thumbnails
3. Upload to backend `/admin/upload`
4. Reorder with drag
5. Delete individual images

## Pages
| Route | Purpose |
|-------|---------|
| `/` | Dashboard overview (stats, recent orders, revenue chart) |
| `/login` | Admin login |
| `/products` | Product list (DataTable) |
| `/products/new` | Create product form |
| `/products/[id]/edit` | Edit product form |
| `/orders` | Order list with status filters |
| `/orders/[id]` | Order detail with timeline + status update |
| `/customers` | Customer list |
| `/customers/[id]` | Customer detail + order history |
| `/categories` | Category management (tree view) |
| `/reviews` | Review moderation queue |
| `/analytics` | Revenue charts, top products, inventory alerts |

## Component Organization
```
src/components/
├── layout/     Sidebar, Header, DashboardShell
├── ui/         DataTable, Modal, StatusBadge, StatCard, Toast
├── products/   ProductForm, ImageUploader, VariantManager
└── orders/     OrderTimeline, OrderDetails
```

## Design Tokens
Shares the same color palette as the storefront but uses a more data-dense, business UI:
- Sidebar: bg-primary-dark (#283d3b)
- Active nav item: bg-primary (#197278)
- Status badges: color-coded per order/payment status
- Cards: clean white with subtle borders
- Tables: compact rows, hover highlights

## API Calls
All admin endpoints are prefixed with `/admin/`:
- `GET/POST /admin/products`, `PATCH/DELETE /admin/products/:id`
- `GET /admin/orders`, `PATCH /admin/orders/:id/status`
- `GET /admin/users`, `GET /admin/analytics/overview`
- `POST /admin/upload` (image upload)

Always include Authorization header with admin JWT.
