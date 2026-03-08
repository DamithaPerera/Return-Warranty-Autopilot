# Return & Warranty Autopilot - Phase 1

Phase 1 includes:

- Next.js App Router scaffold with TypeScript and TailwindCSS
- Prisma schema for PostgreSQL
- Seed/demo purchase data
- Dashboard + Purchases UI powered by seeded data
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

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run db:migrate -- --name init` - Create/apply migration
- `npm run db:seed` - Seed demo data
