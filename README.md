# Return & Warranty Autopilot - Phase 1

Current MVP includes:

- Next.js App Router scaffold with TypeScript and TailwindCSS
- Prisma schema for PostgreSQL
- Seed/demo purchase data
- Dashboard + Purchases UI powered by seeded data
- Gmail OAuth + sync API with demo fallback mode
- Purchase email classification + AI extraction pipeline (with mock fallback)
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

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run db:migrate -- --name init` - Create/apply migration
- `npm run db:seed` - Seed demo data
