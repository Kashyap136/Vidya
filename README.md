# Vidya

AI-powered academic learning platform. Upload syllabi, extract structured topics, generate quizzes, create study plans, and track progress.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **ORM:** Prisma 7
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **AI:** Google Gemini
- **Auth:** Auth.js v5 (Google OAuth + Credentials with Argon2id)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Testing:** Vitest

## Architecture

```
UI (Server Components / Client Components)
    ↓
Server Actions (validate → auth → authorize)
    ↓
Services (business logic, AI orchestration)
    ↓
Repositories (Prisma CRUD, soft-delete, pagination)
    ↓
Supabase PostgreSQL + Storage + Gemini API
```

## Prerequisites

- Node.js 20+
- Supabase project (PostgreSQL + Storage)
- Google Gemini API key
- Google OAuth credentials

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Seed development data
npx prisma db seed

# Start development server
npm run dev
```

## Environment Variables

Required variables (see `.env.example`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (with pgBouncer) |
| `DIRECT_URL` | Direct PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `AUTH_SECRET` | Auth.js secret (min 32 chars) |
| `AUTH_URL` | Application URL for auth callbacks |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `NEXT_PUBLIC_APP_URL` | Public application URL |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:migrate` | Create migration |
| `npm run db:deploy` | Apply migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Production Deployment

1. Configure all environment variables in Vercel
2. Run `npx prisma migrate deploy` to apply migrations
3. Deploy via Vercel (auto-deploys from `main` branch)
4. Verify health check at `NEXT_PUBLIC_APP_URL`
5. Monitor logs and error rates

## Security

- Argon2id password hashing (OWASP recommended)
- JWT-based sessions with 30-day expiry
- Route protection via Next.js proxy middleware
- All server inputs validated with Zod
- AI outputs validated with Zod schemas
- Security headers enforced (CSP, HSTS, X-Frame-Options, etc.)
- Soft-delete for all user-owned entities
- Ownership checks on every protected operation
- Parameterized queries via Prisma (no raw SQL)
- No secrets committed to repository

## CI/CD

GitHub Actions runs on every push/PR to `main`:

1. Install dependencies (`npm ci`)
2. Generate Prisma Client
3. TypeScript check (`tsc --noEmit`)
4. Lint (`eslint`)
5. Unit tests (`vitest run`)
6. Production build (`next build`)
