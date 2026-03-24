# Review Moderation Feature — Design Spec

**Project:** Ceramic E-Commerce Backend
**Date:** 2026-03-24
**Scope:** Backend only (REST API + Prisma schema). No frontend.
**Status:** Approved

---

## Overview

Add a product review system with admin moderation to the Ceramic backend. Customers submit star-rated text reviews that start as `PENDING` (hidden). Admins approve or reject reviews via a dedicated admin API. Only `APPROVED` reviews are visible publicly. Average rating is computed on the fly — no denormalization.

---

## 1. Database Schema

### New enum

```prisma
enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### New model: `Review`

```prisma
model Review {
  id              String       @id @default(cuid())
  productId       String       @map("product_id")
  product         Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId          String       @map("user_id")
  user            User         @relation("ReviewAuthor", fields: [userId], references: [id], onDelete: Cascade)
  rating          Int
  body            String
  status          ReviewStatus @default(PENDING)
  moderatedBy     String?      @map("moderated_by")
  moderator       User?        @relation("ReviewModerator", fields: [moderatedBy], references: [id])
  moderatedAt     DateTime?    @map("moderated_at")
  rejectionReason String?      @map("rejection_reason")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@index([status])
  @@index([productId, status])
  @@map("reviews")
}
```

**No `@@unique([userId, productId])` at DB level.** Duplicate prevention is enforced in application logic so that a user whose review was rejected may resubmit.

### Model relation additions

- `User` gains: `authoredReviews Review[] @relation("ReviewAuthor")` and `moderatedReviews Review[] @relation("ReviewModerator")`
- `Product` gains: `reviews Review[]`

### Indexes

| Index | Purpose |
|---|---|
| `@@index([status])` | Admin queue — filter all reviews by status |
| `@@index([productId, status])` | Product page — fetch only approved reviews for a product |

---

## 2. API Endpoints

### Public / Customer

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | `verifyToken` | Submit a review. Creates as `PENDING`. Returns `201`. |
| `GET` | `/api/reviews/:productId` | none | Returns approved reviews + `avgRating` + `reviewCount`. Returns all approved reviews (no pagination — see §9). |

**Router mounting:** `app.use('/api/reviews', reviewRoutes)` and `app.use('/api/admin/reviews', adminReviewRoutes)`. The public `:productId` param and the admin `/count` path are on separate routers — no collision.

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/reviews` | admin | List reviews. Optional `?status=pending\|approved\|rejected`. |
| `GET` | `/api/admin/reviews/count` | admin | Count by status — for nav badge. |
| `PATCH` | `/api/admin/reviews/:id/status` | admin | Approve, reject, or unpublish a review. |
| `DELETE` | `/api/admin/reviews/:id` | admin | Hard delete a review. |

### Public response shape

`status`, `moderatedBy`, `moderatedAt`, and `rejectionReason` are **never included** in public API responses. Stripped in the controller.

`GET /api/reviews/:productId` response:
```json
{
  "reviews": [
    {
      "id": "...",
      "rating": 4,
      "body": "Lovely glaze finish.",
      "createdAt": "...",
      "user": { "id": "...", "email": "..." }
    }
  ],
  "avgRating": 4.3,
  "reviewCount": 12
}
```

---

## 3. Service Layer

**File:** `src/services/reviewService.js`

| Function | Signature | Description |
|---|---|---|
| `submitReview` | `(userId, productId, rating, body)` | Resubmission logic + create, wrapped in `db.$transaction()` |
| `getApprovedReviews` | `(productId)` | Approved reviews + Prisma aggregate (see query pattern below) |
| `moderateReview` | `(reviewId, adminId, status, rejectionReason?)` | Core moderation action |
| `getAllReviews` | `({ status? })` | Admin list with optional filter |
| `getReviewCounts` | `()` | `{ pending, approved, rejected }` — returns zeros if no reviews |
| `deleteReview` | `(reviewId)` | Hard delete |

### `getApprovedReviews` — Prisma query pattern

```js
const [reviews, aggregate] = await Promise.all([
  db.review.findMany({
    where: { productId, status: 'APPROVED' },
    select: {
      id: true, rating: true, body: true, createdAt: true,
      user: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  }),
  db.review.aggregate({
    where: { productId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  }),
]);
return {
  reviews,
  avgRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : null,
  reviewCount: aggregate._count,
};
```

The `select` on the user relation ensures only `id` and `email` are returned — never `passwordHash`, `refreshToken`, or other sensitive fields.

---

## 4. State Machine

Valid status transitions:

```
PENDING  → APPROVED   (admin approves)
PENDING  → REJECTED   (admin rejects; rejectionReason optional)
APPROVED → PENDING    (admin unpublishes)
REJECTED → [deleted]  (user resubmits — old record deleted, new PENDING created)
```

**Invalid transitions** (`moderateReview` throws `400`):
- `APPROVED → REJECTED` — admin must unpublish first
- `REJECTED → APPROVED` — not allowed
- Any transition to the same status

---

## 5. Resubmission Logic (`submitReview`)

```
1. SELECT review WHERE userId = ? AND productId = ? AND status != REJECTED
2. If found → throw 409 "You have already reviewed this product"
3. SELECT review WHERE userId = ? AND productId = ? AND status = REJECTED
4. If found → delete it
5. Create new review with status = PENDING
```

Steps 3–5 are wrapped in `db.$transaction()` to prevent a race condition where two concurrent resubmissions could both pass the duplicate check and both attempt to create a review.

This pattern allows a rejected user to resubmit without hitting a DB-level unique constraint violation.

---

## 6. Error Handling

| Scenario | HTTP Status |
|---|---|
| `rating` outside 1–5 or missing `body` | `400` (Joi validation) |
| Product not found on submit | `404` |
| User already has active (non-rejected) review | `409` |
| Invalid status transition | `400` |
| Review not found on moderate/delete | `404` |
| Customer accesses admin endpoint | `403` |
| Unauthenticated `POST /api/reviews` | `401` |

---

## 7. Files Changed / Created

| File | Action |
|---|---|
| `prisma/schema.prisma` | Add `ReviewStatus` enum, `Review` model, relations on `User` and `Product` |
| `src/services/reviewService.js` | New |
| `src/controllers/reviewController.js` | New |
| `src/validators/reviewValidator.js` | New |
| `src/routes/reviews.js` | New |
| `src/routes/admin/reviews.js` | New |
| `src/app.js` | Add two `app.use()` lines |
| `tests/unit/services/reviewService.test.js` | New |

---

## 8. Unit Tests (`reviewService.test.js`)

| Test | Description |
|---|---|
| `submitReview` — creates review | Happy path: new PENDING review created |
| `submitReview` — resubmits after rejection | Deletes REJECTED, creates new PENDING |
| `submitReview` — throws 409 on duplicate | Active review exists → 409 |
| `submitReview` — throws 404 for unknown product | Product not found → 404 |
| `getApprovedReviews` — returns only approved | Only APPROVED reviews returned with avgRating/reviewCount |
| `moderateReview` — approves pending | PENDING → APPROVED |
| `moderateReview` — rejects with reason | PENDING → REJECTED with rejectionReason |
| `moderateReview` — unpublishes approved | APPROVED → PENDING |
| `moderateReview` — throws 400 for invalid transition | APPROVED → REJECTED throws 400 |
| `getAllReviews` — returns all | No filter returns all reviews |
| `getAllReviews` — filters by status | ?status=pending returns only PENDING |
| `getReviewCounts` — returns counts | Returns { pending, approved, rejected } |
| `getReviewCounts` — returns zeros when empty | No reviews exist → { pending: 0, approved: 0, rejected: 0 } |
| `deleteReview` — hard deletes | Review removed |
| `deleteReview` — throws 404 if not found | Missing review → 404 |

All tests mock `../../src/config/db` using the existing `src/config/__mocks__/db.js` pattern.

---

## 9. Out of Scope

- Email/push notifications on approve or reject
- Pagination on `GET /api/reviews/:productId` (can be added later)
- Auto-approval rules (e.g., 4+ stars auto-approved)
- Denormalized `avgRating`/`reviewCount` columns on Product
- Frontend/UI surfaces
