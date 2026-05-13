# Contributing

This guide gets you from zero to a working local environment. Target time: under 30 minutes.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| npm | 10+ | bundled with Node.js |
| Docker | 24+ | [docker.com](https://www.docker.com/get-started) |
| Git | any | [git-scm.com](https://git-scm.com) |

## Quick start

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-name>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env if needed — defaults work for local Docker setup

# 4. Start the database
docker compose up -d db

# 5. Run migrations and generate Prisma client
npm run db:migrate
npm run db:generate

# 6. (Optional) Seed the database
npm run db:seed

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app.

## Project structure

```
.
├── .github/
│   └── workflows/       # CI/CD pipelines
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   │   └── api/         # API route handlers
│   ├── lib/             # Shared utilities
│   │   └── db.ts        # Prisma client singleton
│   └── tests/           # Unit and integration tests
├── .env.example         # Environment variable template
├── docker-compose.yml   # Local services (Postgres)
├── next.config.ts       # Next.js configuration
├── package.json
├── tsconfig.json
└── vitest.config.ts     # Test runner configuration
```

## Development workflow

### Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Auto-format with Prettier |
| `npm run format:check` | Check formatting (used in CI) |
| `npm run typecheck` | TypeScript type check without emitting |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:migrate` | Run database migrations (dev) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Run seed script |
| `npm run db:reset` | Drop and recreate the dev database |

### Database changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` — Prisma creates and applies the migration
3. Run `npm run db:generate` — regenerates the type-safe client
4. Commit both the schema change and the generated migration file

### Adding a new API route

Create a file under `src/app/api/<path>/route.ts`. Export named async functions for each HTTP method (`GET`, `POST`, `PATCH`, `DELETE`). See `src/app/api/health/route.ts` for a minimal example.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for session signing |
| `NEXTAUTH_URL` | Yes | App base URL (e.g. `http://localhost:3000`) |

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Code standards

- **TypeScript strict mode** is on — no implicit `any`, no unchecked access.
- **ESLint** enforces project rules; Prettier enforces formatting. Both run in CI and will fail the build if violated.
- **No comments on obvious code.** Add a comment only when the _why_ is non-obvious.
- **Tests:** write unit tests for logic in `src/tests/`. E2E tests live in `e2e/` (Playwright).

## Pull request process

1. Branch from `main`: `git checkout -b feat/my-feature`
2. Make changes, commit with a clear message
3. Push and open a PR against `main`
4. CI runs automatically — lint, typecheck, tests, and build must all pass
5. One approval is required before merging
6. Squash and merge to keep history clean

## CI / CD

| Workflow | Triggers | Jobs |
|----------|----------|------|
| `ci.yml` | All PRs and pushes to `main`/`develop` | Lint, typecheck, unit tests, build, E2E (main only) |
| `deploy.yml` | Push to `main` | Deploy to Vercel (production) |

Required GitHub secrets for deployment:

| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel dashboard → Account → Tokens |
| `VERCEL_ORG_ID` | `vercel.json` or Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project settings |

## Troubleshooting

**`DATABASE_URL` connection refused**
Make sure Docker is running and the DB container is up: `docker compose up -d db`

**Prisma client out of date**
After any schema change run `npm run db:generate`.

**Port 3000 already in use**
Kill the process or set `PORT=3001` in `.env`.

**Migration fails on fresh clone**
Run `npm run db:reset` to wipe and recreate, then re-apply migrations.
