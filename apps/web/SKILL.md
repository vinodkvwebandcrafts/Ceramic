# Frontend Skills Reference

## Quick Start
```bash
pnpm --filter web dev                # Start dev server (port 3000)
pnpm --filter web build              # Production build
pnpm --filter web lint               # Run linter
```

## Skill: Add a New Page
1. Create `src/app/{route}/page.tsx` (server component by default)
2. Add `loading.tsx` for loading state
3. Add `error.tsx` for error boundary
4. Add metadata via `export const metadata` or `generateMetadata()`
5. Add to Navbar if it's a main nav item

## Skill: Add a Homepage Section
1. Create `src/components/home/{SectionName}.tsx`
2. Choose background: cream (#faf7f4) or warm-white (#f5f0eb) -- alternate!
3. Wrap content in `<Container>` with section padding (py-20 = 5rem)
4. Add eyebrow text (Montserrat 0.625rem uppercase, secondary color)
5. Import in `src/app/page.tsx` in correct order

## Skill: Create a UI Component
1. Create in `src/components/ui/{ComponentName}.tsx`
2. Use `class-variance-authority` for variants
3. Use `forwardRef` for DOM access
4. Accept `className` prop and merge with `cn()`
5. TypeScript props interface extending HTML element props

Example:
```typescript
const buttonVariants = cva('font-ui font-medium rounded-xs transition-all', {
  variants: {
    variant: {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    },
    size: {
      sm: 'h-[1.875rem] text-xs px-3.5',
      md: 'h-[2.125rem] text-[0.8125rem] px-[1.125rem]',
      lg: 'h-10 text-sm px-6',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

## Skill: Product Card
```tsx
<ProductCard product={product} />
// Renders: image (1:1), badges, category eyebrow, name, stars, price + add btn
// Uses formatINRWithSymbol for price display
```

## Skill: Cart Operations
```typescript
const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
// Guest: localStorage persistence
// Logged in: synced with backend /cart API
```

## Design Token Quick Reference
| Token | Tailwind Class | Value |
|-------|---------------|-------|
| Primary | `bg-primary` | #197278 |
| Primary Dark | `bg-primary-dark` | #283d3b |
| Secondary | `bg-secondary` | #c44536 |
| Tint | `bg-tint` | #edddd4 |
| Cream | `bg-cream` | #faf7f4 |
| Warm White | `bg-warm-white` | #f5f0eb |
| Section padding | `py-20` | 5rem |
| Container | `max-w-[75rem] mx-auto px-6` | 1200px |

## Common Gotchas
- Server components can't use hooks, event handlers, or browser APIs
- Always use `formatINRWithSymbol()` for prices -- API returns paise
- Image optimization: use Next.js `<Image>` component, not `<img>`
- Cart state needs "use client" -- wrap cart UI in client components
- Alternating backgrounds: cream ↔ warm-white for sections
- Mobile-first responsive: sm:, md:, lg:, xl: breakpoints
