# Return & Warranty Autopilot - Phase 1

Current MVP includes:

- Next.js App Router scaffold with TypeScript and TailwindCSS
- Prisma schema for PostgreSQL
- Seed/demo purchase data
- Dashboard + Purchases UI powered by seeded data
- Gmail OAuth + sync API with demo fallback mode
- Purchase email classification + AI extraction pipeline (with mock fallback)
- Deadline recalculation engine + claim generator (AI/template fallback)
- Basic API route handlers

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL (Neon-compatible)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Set `DATABASE_URL` in `.env` to your Neon/Postgres connection string.

4. Run Prisma migration:

```bash
npm run db:migrate -- --name init
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start app:

```bash
npm run dev
```

Visit:

- `/dashboard`
- `/purchases`
- `/purchases/[id]`
- `/connect/gmail`

## Gmail Demo Mode

If `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing, Gmail runs in demo mode:

- Connect action will mark a demo Gmail account
- Sync action will load sample emails
- HTML email bodies are normalized to plain text for downstream extraction

## Extraction Pipeline

When `/api/gmail/sync` runs, the app executes:

1. Email sync
2. Rule-based classification:
   - `purchase_confirmation`
   - `shipping_update`
   - `invoice`
   - `other`
3. Purchase extraction (OpenAI when `OPENAI_API_KEY` exists, mock extraction otherwise)
4. Persistence into `Purchase` and `PurchaseItem`

## Phase 4 APIs

- `POST /api/purchases/[id]/recalculate`
- `POST /api/claims/generate`

## Demo Instructions

Use this flow for hackathon demos even when Gmail and OpenAI are not configured.

1. Set only `DATABASE_URL` in `.env`.
2. Run migrations and start app:
   - `npm run db:migrate -- --name init`
   - `npm run dev`
3. Open `/dashboard`:
   - Demo data auto-loads if there are no purchases.
   - You can re-load/reset demo content anytime with `Load Demo Data`.
4. Open `/connect/gmail` and click `Sync Emails`:
   - Works in demo mode without Gmail credentials.
5. Open any purchase and click `Generate Claim`:
   - Falls back to template generation when `OPENAI_API_KEY` is missing.

Demo includes:

- Demo purchases
- Demo email dataset
- Demo extraction results (merchant/order/item fields + confidence)
- Demo generated claims

### Screenshots

![Dashboard Demo](docs/screenshots/dashboard-demo.svg)
![Gmail Demo](docs/screenshots/gmail-demo.svg)
![Claim Demo](docs/screenshots/claim-demo.svg)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run db:migrate -- --name init` - Create/apply migration
- `npm run db:seed` - Seed demo data
