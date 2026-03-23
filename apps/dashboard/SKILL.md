# Dashboard Skills Reference

## Quick Start
```bash
pnpm --filter dashboard dev          # Start dev server (port 3001)
pnpm --filter dashboard build        # Production build
```

## Skill: Add a New Admin Page
1. Create `src/app/{resource}/page.tsx`
2. Add sidebar link in `src/components/layout/Sidebar.tsx`
3. For list pages: use `DataTable` with column definitions
4. For detail pages: use card layout with sections
5. For forms: use React Hook Form + Zod schema from `@ceramic/utils`

## Skill: Create a DataTable
```typescript
const columns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span>{row.original.name}</span> },
  { accessorKey: 'price', header: 'Price', cell: ({ row }) => formatINRWithSymbol(row.original.basePrice) },
  // ... more columns
  { id: 'actions', cell: ({ row }) => <ActionMenu row={row} /> },
];

<DataTable columns={columns} data={products} pagination={pagination} />
```

## Skill: Create a Form
```typescript
const form = useForm<CreateProductInput>({
  resolver: zodResolver(createProductSchema),
  defaultValues: { name: '', basePrice: 0, ... },
});

<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('name')} error={form.formState.errors.name?.message} />
</form>
```

## Skill: Add a Chart
```typescript
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={revenueData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="revenue" stroke="#197278" fill="#197278" fillOpacity={0.1} />
  </AreaChart>
</ResponsiveContainer>
```

## Skill: Status Badge
```typescript
<StatusBadge status={order.status} />
// Renders: colored badge based on status
// PENDING=amber, CONFIRMED=blue, PROCESSING=indigo, SHIPPED=purple, DELIVERED=green, CANCELLED=red
```

## Layout Pattern
```
┌─────────┬──────────────────────────────┐
│ Sidebar │  Header (breadcrumb + user)  │
│  w-64   ├──────────────────────────────┤
│         │  Main Content Area           │
│  nav    │  (pages render here)         │
│  items  │                              │
│         │  padding: 1.5rem             │
└─────────┴──────────────────────────────┘
```

## Common Gotchas
- All API calls need admin JWT in Authorization header
- Product prices: input in ₹ (rupees), store/send as paise. Convert on form submit.
- Image upload: upload to Cloudinary first, then save URL with product
- Order status transitions are one-directional (can't go backwards)
- DataTable pagination is server-side -- pass page/limit to API
- Charts need "use client" -- Recharts requires browser APIs
