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
| `SMTP_HOST` | SMTP server hostname (for email verification) |
| `SMTP_PORT` | SMTP server port (465 for SSL, 587 for TLS) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for outgoing emails |
| `AUTH_TRUST_HOST` | Set `true` in production when behind a proxy |

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

### Prerequisites

- Vercel account (or Node.js 20+ hosting)
- Supabase project (PostgreSQL + Storage buckets)
- Google Gemini API key with billing enabled
- Google OAuth credentials (Web application type)
- SMTP credentials for email verification

### Steps

1. **Environment:** Configure all environment variables in Vercel project settings
2. **Database:** Run `npx prisma migrate deploy` to apply migrations
3. **Storage:** Create `syllabi` bucket in Supabase Storage (public or with RLS)
4. **Auth:** Configure Google OAuth redirect URIs to include `{YOUR_URL}/api/auth/callback/google`
5. **Deploy:** Deploy via Vercel (auto-deploys from `main` branch)
6. **Verify:** Health check at `NEXT_PUBLIC_APP_URL/api/health`
7. **Monitor:** Check Vercel logs and error rates post-deployment

### Post-Deployment Checklist

- [ ] SMTP email sending works (verify registration flow)
- [ ] Google OAuth login works
- [ ] PDF upload and processing pipeline completes
- [ ] Text syllabus creation succeeds
- [ ] Gemini AI generates topics and quizzes
- [ ] Study plan generation works
- [ ] Study day task completion persists
- [ ] Quiz scoring and history is accurate
- [ ] Progress tracking updates in real-time
- [ ] Logout and re-login preserves all data

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
