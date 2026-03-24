# CLAUDE.md — Ceramic E-Commerce Backend

## Project Overview
REST API backend for a ceramic shop. Express.js + PostgreSQL (Prisma ORM). No frontend.

## Tech Stack
- Node.js 20, Express.js
- PostgreSQL 15, Prisma ORM
- Jest (unit + integration tests)
- JWT auth (access 15m, refresh 7d)
- Stripe payments

## Key Rules
- JavaScript ONLY — no TypeScript, no .ts files
- Every new function must have a unit test
- Use JSDoc for type hints where helpful
- Stripe webhook must remain idempotent (check stripeEventId before processing)
- Do not build frontend or admin dashboard

## Architecture
- Routes → Controllers → Services → Prisma (db.js singleton)
- Services contain all business logic
- Controllers only call services and format HTTP responses
- Middleware: auth.js (JWT), admin.js (role check), errorHandler.js, validate.js (Joi)

## Running the Project
- Dev: `npm run dev`
- Test: `npm test`
- Unit only: `npm run test:unit`
- Migrate DB: `npm run db:migrate`
- Seed: `npm run db:seed`

## Environment
Copy `.env.example` to `.env` and fill in values before running.
