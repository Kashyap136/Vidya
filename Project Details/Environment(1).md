# Environment Configuration Guide

**Project:** Vidya

**Version:** 1.0.0

**Status:** Production Standard

---

# Table of Contents

1. Purpose
2. Configuration Philosophy
3. Environment Types
4. Required Environment Variables
5. Variable Naming Standards
6. Local Development
7. Staging Environment
8. Production Environment
9. Feature Flags
10. Secret Management
11. Validation
12. Rotation Policy
13. Security Rules
14. Environment Checklist
15. Future Improvements

---

# 1. Purpose

This document defines every configuration value required by Vidya.

Configuration must never be hardcoded.

All environment-specific settings should be injected through environment variables.

---

# 2. Configuration Philosophy

Configuration should be

- Secure
- Predictable
- Version controlled (except secrets)
- Environment specific

Application code should never change when deploying to a different environment.

Only configuration should change.

---

# 3. Environment Types

## Development

Purpose

Local development.

Characteristics

- Debugging enabled
- Test data
- Development APIs

---

## Staging

Purpose

Pre-production testing.

Characteristics

- Mirrors production
- QA testing
- UAT

---

## Production

Purpose

Real users.

Characteristics

- Secure
- Stable
- Monitored
- Optimized

---

# 4. Required Environment Variables

## Database

```env
DATABASE_URL=

DIRECT_URL=
```

---

## Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
```

---

## Auth.js

```env
AUTH_SECRET=

AUTH_URL=
```

---

## Google OAuth

```env
GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
```

---

## Gemini

```env
GEMINI_API_KEY=
```

---

## Application

```env
NODE_ENV=

NEXT_PUBLIC_APP_URL=
```

---

## Analytics (Future)

```env
POSTHOG_KEY=

POSTHOG_HOST=
```

---

## Monitoring (Future)

```env
SENTRY_DSN=
```

---

## Email (Future)

```env
RESEND_API_KEY=
```

---

## Storage

Handled by Supabase.

No extra configuration required beyond Supabase credentials.

---

# 5. Variable Naming Standards

Rules

Use

UPPER_SNAKE_CASE

Examples

```
DATABASE_URL

GEMINI_API_KEY

NEXT_PUBLIC_APP_URL
```

Avoid

```
databaseUrl

db

api

key
```

---

# 6. Local Development

Use

```
.env.local
```

Never commit

```
.env.local
```

Every developer should maintain their own local environment.

---

# 7. Staging Environment

Configure

- Separate database
- Separate storage bucket where appropriate
- Separate API keys if available
- Separate analytics project

Never reuse production secrets in staging.

---

# 8. Production Environment

Production must use

- Production database
- Production storage
- Production monitoring
- Production analytics

Environment variables should only be managed through the hosting platform (e.g., Vercel).

---

# 9. Feature Flags

Future feature flags

```
ENABLE_AI_CHAT

ENABLE_FLASHCARDS

ENABLE_CERTIFICATES

ENABLE_NOTIFICATIONS

ENABLE_DARK_MODE
```

Feature flags allow incomplete features to remain disabled until ready.

---

# 10. Secret Management

Secrets include

- API keys
- Database credentials
- Service role keys
- Private tokens

Rules

Never

- Commit secrets
- Log secrets
- Share secrets in chat
- Store secrets in source code

Rotate secrets periodically.

---

# 11. Validation

The application should validate required environment variables during startup.

If a required variable is missing

↓

Fail startup

↓

Display meaningful error

↓

Prevent deployment

Never silently ignore missing configuration.

---

# 12. Rotation Policy

Rotate

- API Keys
- Service Role Keys
- Database passwords
- Third-party credentials

Suggested schedule

Every 90–180 days or immediately after suspected compromise.

---

# 13. Security Rules

Never expose

- DATABASE_URL
- DIRECT_URL
- SUPABASE_SERVICE_ROLE_KEY
- AUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GEMINI_API_KEY

Variables prefixed with

```
NEXT_PUBLIC_
```

are publicly available to the client and must never contain secrets.

---

# 14. Environment Checklist

Before deployment verify

✓ Required variables exist

✓ No placeholder values remain

✓ Secrets stored securely

✓ Public variables reviewed

✓ Environment validation passes

✓ Separate production and staging configuration

✓ Documentation updated

---

# 15. Future Improvements

- Secret rotation automation
- External secret manager integration
- Configuration validation library
- Environment auditing
- Configuration drift detection
- Infrastructure as Code

---

# Example Directory

```
project/

.env.example

.env.local

.env.test

.gitignore
```

---

# .env.example

```
DATABASE_URL=

DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

AUTH_SECRET=

AUTH_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=

NEXT_PUBLIC_APP_URL=
```

Never include actual values in `.env.example`.

---

# Environment Principles

Configuration should be:

- Secure
- Explicit
- Documented
- Validated
- Easy to reproduce

Changing environments should never require changing application code.

---

# End of Document
