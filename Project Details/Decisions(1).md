# Architecture Decision Records (ADR)

**Project:** Vidya

**Version:** 1.0.0

**Status:** Living Document

---

# Purpose

This document records every major architectural decision made during the development of Vidya.

The objective is to preserve the reasoning behind important technical choices so that future contributors understand **why** a decision was made, not just **what** was chosen.

Whenever a significant technical decision is made, a new ADR must be added.

---

# ADR Format

Every decision should follow this template.

```
ADR-XXX

Title

Status

Date

Context

Decision

Alternatives Considered

Advantages

Disadvantages

Consequences

Future Review
```

---

# ADR-001

## Title

Use Next.js App Router

Status

Accepted

Date

July 2026

### Context

Vidya requires:

- Server Components
- Server Actions
- Streaming
- Modern React architecture
- Excellent developer experience

### Decision

Use Next.js 16 App Router.

### Alternatives

- React + Express
- Remix
- Nuxt
- Traditional REST backend

### Advantages

- Excellent React ecosystem
- Server Components
- Built-in routing
- Easy deployment on Vercel
- Strong community support

### Disadvantages

- Learning curve
- Rapid framework evolution

### Consequences

Entire project follows App Router conventions.

---

# ADR-002

## Title

Use Supabase (PostgreSQL + Storage only)

Status

Accepted

### Context

Project requires

- PostgreSQL
- Storage
- Scalability

### Decision

Use Supabase for PostgreSQL and Storage only.

Authentication is handled by Auth.js v5.

### Alternatives

Firebase

MongoDB Atlas

Neon

Railway

Self-hosted PostgreSQL

### Advantages

- PostgreSQL
- Storage
- RLS
- Dashboard
- Open source

### Disadvantages

- Vendor dependency
- PostgreSQL knowledge required

---

# ADR-003

## Title

Use Prisma ORM

Status

Accepted

### Context

Need

- Type Safety
- Migrations
- Excellent Developer Experience

### Decision

Use Prisma.

### Alternatives

Drizzle

TypeORM

Sequelize

Raw SQL

### Advantages

- Excellent DX
- Strong typing
- Schema-first
- Migration support

### Disadvantages

- Additional abstraction
- Some advanced PostgreSQL features require raw SQL

---

# ADR-004

## Title

Use Google Gemini

Status

Accepted

### Context

Project requires structured AI output.

### Decision

Use Gemini.

### Alternatives

OpenAI

Claude

Llama

Mistral

### Advantages

- Strong structured output
- Good cost/performance
- JSON support

### Disadvantages

- External API dependency
- Rate limits

---

# ADR-005

## Title

Prefer Server Actions

Status

Accepted

### Context

Need simple backend architecture.

### Decision

Use Server Actions by default.

### Alternatives

REST APIs

GraphQL

tRPC

### Advantages

- Less boilerplate
- Better type safety
- Simpler architecture

### Disadvantages

- Less suitable for third-party consumers
- Mobile apps may still require REST endpoints

---

# ADR-006

## Title

Validate Every AI Response

Status

Accepted

### Context

AI output is probabilistic.

### Decision

Every AI response must pass Zod validation before use.

### Alternatives

Trust AI output

### Advantages

- Better reliability
- Prevents malformed data
- Improves security

### Consequences

AI responses may be rejected and regenerated when validation fails.

---

# ADR-007

## Title

Use UUID Primary Keys

Status

Accepted

### Context

Need globally unique identifiers.

### Decision

Every primary key uses UUID.

### Alternatives

Auto Increment IDs

### Advantages

- Harder to enumerate
- Better for distributed systems
- Suitable for public identifiers

### Disadvantages

- Larger index size
- Less human-readable

---

# ADR-008

## Title

Use Supabase Storage

Status

Accepted

### Context

Need secure PDF storage.

### Decision

Store uploaded files in Supabase Storage.

Database stores only metadata.

### Alternatives

Store PDFs in database

AWS S3

Cloudinary

### Advantages

- Efficient
- Scalable
- Integrated with Supabase

### Disadvantages

- Separate storage management

---

# ADR-009

## Title

Adopt Clean Architecture

Status

Accepted

### Decision

Separate application into

UI

↓

Server Actions

↓

Services

↓

Repositories

↓

Database

Business logic must never live inside React components.

---

# ADR-010

## Title

Use TypeScript Strict Mode

Status

Accepted

### Decision

Strict mode enabled for entire project.

### Reason

Prevent runtime errors.

Improve maintainability.

---

# ADR-011

## Title

Use Auth.js v5

Status

Superseded by ADR-018

Date

July 2026

### Context

Project requires:

- OAuth (Google)
- Credentials (email/password)
- Session management
- Database-backed users via Prisma
- Secure password hashing

### Decision

Use Auth.js v5 with Google Provider, Credentials Provider, and JWT Strategy.

Password hashing uses Argon2id.

**Note:** PrismaAdapter is not used. See ADR-018 for the reasoning. User and Account records are managed manually via the signIn callback.

### Alternatives

- Supabase Auth
- Clerk
- NextAuth v4
- Lucia Auth

### Advantages

- Open source
- Multiple providers
- JWT or database sessions
- Large community

### Disadvantages

- More configuration than managed auth
- Self-managed sessions

### Consequences

Supabase is no longer used for authentication. Only PostgreSQL and Storage.

---

# ADR-012

## Title

Use Enum ProcessingStatus instead of Boolean

Status

Accepted

Date

July 2026

### Context

The original schema used `isProcessed` boolean which cannot represent intermediate states like extracting, parsing, or generating.

### Decision

Replace `isProcessed` with `ProcessingStatus` enum:

UPLOADED | EXTRACTING | PARSING | GENERATING | COMPLETED | FAILED

### Alternatives

- Keep boolean
- Use string status
- Use multiple boolean flags

### Advantages

- Better state representation
- Supports retries
- Better debugging
- Enables progress UI

### Consequences

Schema migration required. All queries checking `isProcessed` must be updated.

---

# ADR-013

## Title

Dark Mode is a Version 1 Requirement

Status

Accepted

Date

July 2026

### Context

All components must support Light, Dark, and System themes.

### Decision

Dark Mode is included in Version 1, not a future feature.

### Consequences

Every component must implement theme support from the start. Uses Tailwind CSS dark mode and CSS custom properties.

---

# ADR-014

## Title

Certificates Generated as PDFs

Status

Accepted

Date

July 2026

### Context

Certificates must be downloadable, printable, and verifiable.

### Decision

Generate certificates as PDFs (not images).

### Alternatives

- PNG/SVG images
- HTML pages
- Physical certificates

### Advantages

- Printable
- Standard format
- Embeddable metadata

### Consequences

A PDF generation library is required.

---

# ADR-015

## Title

Resource Recommendation Must Be Ranked

Status

Accepted

Date

July 2026

### Context

AI was selecting resources without consistent quality criteria.

### Decision

AI must rank resources by priority:

1. Official Documentation
2. Free Textbooks
3. High Quality YouTube Playlists
4. Articles
5. Practice Websites

### Alternatives

- Random selection
- User-rated resources
- Only one resource type

### Advantages

- Higher quality recommendations
- Consistent behavior
- Better learning outcomes

### Consequences

Prompts must include ranking criteria and schema.

---

# ADR-016

## Title

Structured Logging for Server Actions

Status

Accepted

Date

July 2026

### Context

Server Actions lacked consistent logging making debugging difficult.

### Decision

Every Server Action must record:

- requestId
- userId
- executionTime
- databaseLatency
- aiLatency
- status
- errors

### Consequences

A logging utility function must be created and used by all Server Actions.

---

# ADR-017

## Title

Soft Deletes for User-Owned Data

Status

Accepted

Date

July 2026

### Context

Hard deletes risk data loss and prevent recovery.

### Decision

User-owned entities use soft deletes via a `deletedAt DateTime?` field.

### Alternatives

- Hard deletes
- Audit tables
- Deletion logs

### Advantages

- Recoverable data
- Audit trail
- Safe deletion

### Consequences

All queries must filter `WHERE deletedAt IS NULL`.

---

# ADR-018

## Title

No PrismaAdapter — Manual User and Account Management

Status

Accepted

Date

July 2026

### Context

Auth.js v5 offers a PrismaAdapter that automatically creates User, Account, Session, and VerificationToken records when OAuth sign-in occurs. However, with JWT strategy (no database sessions), the adapter creates orphaned Session records that are never read. The Credentials provider requires a custom authorize function that bypasses the adapter entirely, creating inconsistent data flows.

### Decision

Do not use PrismaAdapter. Instead, manage User and Account records manually via the Auth.js signIn callback. JWT strategy is used for session management — no database sessions are created.

The signIn callback:

1. Validates the OAuth profile has an email
2. Rejects sign-in for soft-deleted users
3. Looks up Account by `(provider, providerAccountId)` — authoritative OAuth identity
4. If Account found: loads linked User, updates email if changed
5. If Account not found: falls back to email lookup, creates User if needed
6. Creates an Account record linking the OAuth provider to the User (idempotent via P2002 catch)
7. Mutates the user object to include the database UUID so the jwt callback can store it in the token

See ADR-019 for the identity hardening refactor that established providerAccountId as the authoritative lookup key.

### Alternatives

- Use PrismaAdapter (creates orphaned Session records, inconsistent Credentials flow)
- Use NextAuth v4 (legacy, no longer maintained)
- Use Lucia Auth (different paradigm, larger migration)

### Advantages

- No orphaned Session records in the database
- Consistent data flow for both Credentials and OAuth providers
- Full control over user creation logic (email normalization, soft-delete checks, role assignment)
- Cleaner database — only User and Account records, no unused Session table entries
- Simpler to reason about — Auth.js handles OAuth flow, we handle persistence

### Disadvantages

- Manual Account linking logic (must handle P2002 for idempotency)
- Must implement signIn callback for every OAuth provider
- No automatic email verification sync from providers (must set manually)
- Future providers require explicit signIn callback support

### Trade-offs

| Concern              | PrismaAdapter                   | No Adapter (This Decision) |
| -------------------- | ------------------------------- | -------------------------- |
| Session records      | Created but unused with JWT     | Not created                |
| User creation        | Automatic                       | Manual via signIn callback |
| Account linking      | Automatic                       | Manual with P2002 catch    |
| Credentials flow     | Inconsistent (adapter bypassed) | Consistent (all manual)    |
| Code complexity      | Lower (adapter hides logic)     | Higher (explicit control)  |
| Debugging            | Harder (adapter is opaque)      | Easier (all logic visible) |
| Soft-delete handling | Not built-in                    | Built into signIn callback |

### Implementation

- `src/auth/sign-in.ts` — `handleOAuthSignIn()` function
- `src/auth/config.ts` — signIn callback delegates to `handleOAuthSignIn()`
- `prisma/schema.prisma` — User, Account, Session, VerificationToken models (Session and VerificationToken exist for schema compatibility but are unused with JWT strategy)

### Future Migration Considerations

If the project needs database sessions in the future (e.g., for multi-device session management, session revocation, or admin session monitoring):

1. Add PrismaAdapter
2. Remove the signIn callback's manual Account creation (adapter handles it)
3. Keep the signIn callback's User creation logic (adapter creates User but we control the fields)
4. Run a migration to backfill Session records from existing JWTs

### Consequences

All OAuth user creation and account linking is explicit and testable. The signIn callback is the single point of control for all authentication providers.

---

# ADR-019

## Title

OAuth Identity Hardening — providerAccountId as Authoritative Lookup

Status

Accepted

Date

July 2026

### Context

The original signIn callback used `User.email` as the sole lookup key for OAuth authentication. This created a fragile identity model where:

- A user changing their Google email would get a duplicate User record
- Google returning an email alias would create a split identity
- The Account table was write-only (never read for identity resolution)
- `providerAccountId` was stored but unused for lookup

### Decision

Refactor the signIn callback to use a two-step lookup:

1. **First:** `Account.findFirst(provider, providerAccountId)` — look up by the provider's immutable unique ID
   - If Account found → load linked User → update email if changed → continue
2. **Second (fallback):** `User.findUnique(email)` — email-based lookup for first-time sign-in or new providers
   - If User found → create Account linking → continue
   - If User not found → create User + Account → continue

### Identity Model

| Layer       | Identifier                      | Purpose                           | Mutability |
| ----------- | ------------------------------- | --------------------------------- | ---------- |
| Canonical   | `User.id` (UUID)                | All FK relationships, JWT token   | Immutable  |
| OAuth       | `(provider, providerAccountId)` | Authoritative for OAuth lookups   | Immutable  |
| Credentials | `User.email`                    | Required for email/password login | Mutable    |
| Profile     | `User.name`, `User.image`       | Display attributes                | Mutable    |

### Alternatives

- Keep email-only lookup (breaks on email changes)
- Use `providerAccountId` exclusively (breaks credentials fallback)
- Add a separate `OAuthIdentity` table (over-engineered for V1)

### Advantages

- Identity survives provider email changes
- No duplicate User records from email aliases
- Account table becomes authoritative for OAuth identity
- Email becomes a mutable profile attribute, not an identity anchor
- Backward compatible — existing email-based sign-in still works as fallback

### Disadvantages

- Additional `account.findFirst` query per OAuth sign-in (negligible cost)
- Email update logic must handle uniqueness conflicts (future concern)

### Implementation

- `src/auth/sign-in.ts` — `handleOAuthSignIn()` with two-step lookup
- `prisma/schema.prisma` — `@@unique([provider, providerAccountId])` on Account (already exists)

### Consequences

OAuth identity is now permanent and survives email changes. The Account table is the authoritative source for OAuth identity resolution. Email is a mutable attribute that updates when the provider returns a different value.

---

# ADR-020

## Title

Repository Pattern with BaseRepository and Audit Fields

Status

Accepted

Date

July 2026

### Context

The data access layer initially consisted of standalone functions in `src/repositories/user.ts` with inconsistent patterns: no cursor pagination, no audit trail, no generic CRUD, and no transaction support. Each entity would require its own ad-hoc query implementations.

### Decision

Adopt a generic `BaseRepository<T, CreateInput, UpdateInput>` class that provides:

- Generic CRUD operations (findById, findMany, create, update, softDelete, restore, exists, count)
- Cursor-based pagination with configurable limit (max 100)
- Sort and filter support
- Audit field population (`createdBy`, `updatedBy`) from an `AuditContext`
- Transaction utility via `prisma.$transaction`

Each domain entity gets a concrete repository extending BaseRepository with entity-specific query methods.

Audit fields (`createdBy`, `updatedBy`) are added to User, Account, Syllabus, Topic, and QuizAttempt to track who created or modified each record. These are nullable — system-created records (e.g., OAuth account linking) may not have an audit user.

### Alternatives

- Standalone functions per entity (inconsistent, no pagination, no audit)
- Use a third-party repository library (additional dependency)
- Use Prisma's raw query API (loses type safety)

### Advantages

- Consistent data access pattern across all entities
- Built-in pagination, sorting, filtering
- Automatic audit field population
- Type-safe with Prisma generics
- Transaction support for multi-operation sequences
- Backward-compatible legacy function exports for existing auth code

### Disadvantages

- Additional abstraction layer between services and Prisma
- BaseRepository model type is loosely typed (`Record<string, unknown>`)
- Complex includes/selects require casting

### Implementation

- `src/repositories/types.ts` — PaginationParams, SortParams, FilterParams, QueryOptions, AuditContext interfaces
- `src/repositories/base.ts` — BaseRepository class
- `src/repositories/transaction.ts` — transaction utility
- `src/repositories/user.ts` — UserRepository + legacy function exports (findUserByEmail, createUser, etc.)
- `src/repositories/account.ts` — AccountRepository
- `src/repositories/syllabus.ts` — SyllabusRepository
- `src/repositories/topic.ts` — TopicRepository
- `src/repositories/quiz-attempt.ts` — QuizAttemptRepository
- `src/repositories/session.ts` — SessionRepository
- `src/repositories/index.ts` — re-exports all repositories

### Consequences

All new database access should go through the concrete repositories. Legacy function exports in `user.ts` are maintained for backward compatibility with existing auth code but new services should use `UserRepository` directly.

---

# ADR-021: PDF Processing Pipeline

**Date:** 2026-07-18

**Status:** Accepted

**Context**

The platform requires users to upload academic syllabi as PDFs. The system must validate, store, extract text, and normalize the content before passing it to the AI pipeline for topic generation. This is a critical path: failures here block the entire study plan generation workflow.

**Decision**

Implement a service-oriented PDF processing pipeline with the following characteristics:

1. **Service Decomposition**: Seven focused services with single responsibilities:
   - `PDFValidationService` — File validation (MIME, extension, size, magic bytes, PDF version)
   - `StorageService` — Supabase Storage with ownership verification and path-based access
   - `PDFExtractionService` — Text extraction via pdf-parse v2 (PDFParse class)
   - `TextNormalizationService` — Unicode NFKD, whitespace collapse, smart quotes, control chars
   - `ProcessingService` — Status state machine (UPLOADED → EXTRACTING → COMPLETED/FAILED)
   - `AuditLogService` — Structured logging for every pipeline step
   - `PDFUploadService` — Orchestrator coordinating the full pipeline

2. **Orchestrator Pattern**: `PDFUploadService` orchestrates the pipeline in a single transaction: validate → duplicate check → create DB record → store file → extract text → normalize → update DB. This ensures atomicity — if any step fails, the database is left in a consistent state.

3. **Server Actions as Entry Points**: All client-facing operations go through server actions (`uploadSyllabusAction`, `deleteSyllabusAction`, `retryProcessingAction`) with built-in auth verification, Zod validation, and `useActionState` compatibility.

4. **Validation Layers**: Two validation layers:
   - **Client-side**: Zod schemas in `src/validators/pdf.ts` for form input
   - **Server-side**: `PDFValidationService` for file-level validation (MIME, extension, size, magic bytes, PDF version detection)

5. **Storage Strategy**: Supabase Storage with user-scoped paths (`{userId}/syllabi/{year}/{uuid}_{safeFileName}`), ownership verification on delete, and signed URLs for retrieval.

6. **Text Normalization**: Multi-step normalization pipeline: Unicode NFKD → line ending normalization → whitespace collapse → blank line limiting → smart quote replacement → control character removal → zero-width character removal.

7. **Retry Support**: Failed processing can be retried via `retryProcessingAction`, which re-downloads from storage and re-runs extraction + normalization.

8. **Processing Status State Machine**:
   ```
   UPLOADED → EXTRACTING → COMPLETED
                              ↓
                            FAILED → (retry) → UPLOADED
   ```

**Alternatives Considered**

1. **Background Job Queue (Bull/BullMQ)**: More robust for large files but adds Redis dependency and complexity premature for MVP.
2. **Streaming Pipeline**: Process file chunks as they upload — better for very large files but significantly more complex.
3. **Client-side Text Extraction (pdf.js)**: Offloads server but exposes extraction logic to tampering.

**Rationale**

The orchestrator pattern with transaction wrapping provides the right balance of simplicity and reliability for an MVP. Each service is independently testable and replaceable. The pipeline can be upgraded to background processing later by replacing the orchestrator internals without changing the service interfaces.

### Consequences

- All PDF processing flows through `PDFUploadService.processUpload()` for consistent behavior
- Storage paths are deterministic and user-scoped for security
- Text normalization is applied before storage, ensuring consistent content for AI processing
- Failed uploads can be retried without re-uploading the file
- Every step is audit-logged with request ID, user ID, and duration

### Implementation

- `src/services/pdf-validation.ts` — Validation
- `src/services/storage.ts` — Storage
- `src/services/pdf-extraction.ts` — Extraction
- `src/services/text-normalization.ts` — Normalization
- `src/services/processing.ts` — Status management
- `src/services/audit-log.ts` — Audit logging
- `src/services/pdf-upload.ts` — Orchestrator
- `src/actions/pdf.ts` — Server actions
- `src/types/pdf.ts` — Type definitions
- `src/validators/pdf.ts` — Zod schemas

---

ADR-022

Search Engine

ADR-023

Vector Database

ADR-024

Offline Mode

ADR-025

Notifications

ADR-026

Internationalization

ADR-027

AI Memory

ADR-028

Analytics Platform

ADR-029

Monitoring Stack

ADR-030

Docker Support

---

# ADR-022: Dashboard Service Layer

Status

Accepted

Date

2026-07-18

Context

The dashboard requires aggregating data from multiple database models (User, Syllabus, Topic, QuizAttempt) into unified views. Direct Prisma queries in server actions would lead to duplicated logic, poor testability, and tight coupling between UI and data access.

Decision

Implement a dedicated DashboardService that queries Prisma directly (including raw SQL via `$queryRaw` for efficient aggregation) and returns strongly-typed data structures. Server actions serve as thin wrappers that handle authentication and error formatting.

Alternatives Considered

1. GraphQL API layer
2. Direct Prisma queries in server actions
3. Caching layer with Redis

Advantages

- Single source of truth for dashboard data aggregation
- Raw SQL for complex aggregations (study streak, completion counts) avoids N+1 queries
- Server actions provide type-safe RPC without API route boilerplate
- Testable service layer with clear separation of concerns

Disadvantages

- Additional abstraction layer
- Raw SQL requires manual maintenance if schema changes

Consequences

- Dashboard data queries are centralized in one service
- Server actions remain thin authentication wrappers
- Study streak computation uses efficient date grouping via raw SQL

Future Review

Review if Redis caching is needed for high-traffic dashboards.

---

# ADR-023: Certificate Generation System

Status

Accepted

Date

2026-07-18

Context

Users need verifiable certificates upon completing a syllabus. The system must support eligibility verification, deterministic certificate ID generation, and runtime verification without requiring a persistent certificate store.

Decision

Certificates are generated on-the-fly from quiz completion data. A certificate ID is deterministically derived from `SHA256(userId:syllabusId)` prefixed with `VIDYA-CERT-`. Verification checks the hash, looks up the user and syllabus, and re-validates eligibility criteria (80%+ topics attempted, 70%+ average score). No database table stores certificates.

Alternatives Considered

1. Store certificates in a database table
2. Generate PDF certificates and store in Supabase Storage
3. Use JWT-based certificate tokens

Advantages

- No additional database table required
- Deterministic IDs mean the same certificate is always generated for the same user+syllabus
- Verification is real-time against current data (always up-to-date)
- Simple implementation with crypto hash for tamper resistance
- Certificate format uses `~` separator to avoid conflicts with UUID hyphens

Disadvantages

- No audit trail of certificate issuance
- Certificate content is computed at verification time, not at issuance
- If eligibility criteria change retroactively, old certificates may become invalid

Consequences

- Certificate verification is always current
- Users cannot lose certificates (re-generable)
- Certificate IDs are deterministic and tamper-resistant

Future Review

Review if an issuance audit log is needed for compliance.

---

# Decision Review Process

Every decision should be reviewed if:

- New technology provides significant benefits.
- Performance requirements change.
- Security requirements change.
- Product requirements evolve.
- Existing decision becomes difficult to maintain.

Changing an accepted ADR requires:

1. Documenting the new proposal.
2. Explaining why the existing decision is insufficient.
3. Recording migration impact.
4. Updating related documentation.

Historical ADRs should never be deleted. Instead, mark them as:

- Superseded
- Deprecated
- Replaced

This preserves the architectural history of the project.

---

# Decision-Making Principles

Good architecture favors:

- Simplicity
- Maintainability
- Security
- Scalability
- Developer Experience
- Long-term sustainability

Technology should be chosen because it solves a real problem, not because it is popular.

---

# End of Document
