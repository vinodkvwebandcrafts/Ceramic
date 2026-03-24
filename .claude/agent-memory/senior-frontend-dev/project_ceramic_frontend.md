---
name: Ceramic Frontend Project
description: Next.js 15 storefront for the Ceramic e-commerce backend — stack, location, and key decisions
type: project
---

Separate frontend repo at `C:\Users\wac\Desktop\ceramic-frontend`. JavaScript-only Next.js 15 App Router project consuming the Express backend on port 4000.

**Stack:** Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui (jsx components), DM Sans + Lora fonts, Stripe.js

**Key decisions:**
- API proxied via next.config.mjs rewrites: `/api/*` → `http://localhost:4000/api/*`
- shadcn/ui initialized with `--defaults`; components live in `components/ui/*.jsx`
- globals.css preserves all shadcn CSS variables AND adds earthy tokens (`--color-terracotta`, `--color-sage`, `--color-charcoal`, `--color-warm-gray`, `--color-sand`, `--color-surface`, `--color-success`, `--color-error`) under `@theme inline`
- `--background` overridden to `#faf8f5` (warm off-white) in `:root`
- Fonts set as CSS variables `--font-body` (DM Sans) and `--font-heading` (Lora)

**Why:** Frontend is a separate repo from the backend (C:\Users\wac\Desktop\Ceramic). No TypeScript — JS only per project rules.

**How to apply:** When writing components, use `bg-background`, `text-foreground` for base styles; use `bg-[var(--color-terracotta)]` or Tailwind arbitrary values for earthy accents until Tailwind config picks up the custom tokens.
