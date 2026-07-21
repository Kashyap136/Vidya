# System Architecture

**Project:** Vidya

**Version:** 1.0.0

---

# Table of Contents

1. Overview
2. High-Level Architecture
3. System Components
4. Folder Structure
5. Frontend Architecture
6. Backend Architecture
7. Database Architecture
8. AI Architecture
9. Authentication Flow
10. File Upload Flow
11. Study Plan Generation Flow
12. Deployment Architecture
13. Error Handling Strategy
14. Logging Strategy
15. Scalability
16. Future Architecture

---

# 1. Overview

Vidya follows a modern full-stack architecture using:

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- Supabase Storage
- Gemini AI
- Tailwind CSS
- shadcn/ui
- Auth.js v5 (Google Provider, Credentials Provider, Argon2id, JWT Strategy)

The architecture is designed to be:

- Modular
- Scalable
- Secure
- Maintainable
- Production-ready

---

# 2. High-Level Architecture

```text
                    User
                      │
                      ▼
              Next.js Frontend
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Server Actions              Route Handlers
        │                           │
        └─────────────┬─────────────┘
                      ▼
               Business Logic
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Prisma ORM      Gemini AI      Supabase Storage
      │
      ▼
Supabase PostgreSQL
```

---

# 3. Core Modules

## Authentication

Responsibilities

- Login
- Registration
- Session Management
- Authorization

---

## Dashboard

Responsibilities

- User overview
- Study statistics
- Recent syllabi
- Progress

---

## Syllabus Module

Responsibilities

- Upload PDF
- Store file
- Extract text
- Save syllabus

---

## AI Module

Responsibilities

- Parse syllabus
- Generate topics
- Generate summaries
- Recommend resources

---

## Study Planner

Responsibilities

- Generate roadmap
- Estimate study time
- Prioritize topics

---

## Quiz Module

Responsibilities

- Generate quizzes
- Evaluate answers
- Save scores

---

## Progress Module

Responsibilities

- Track completion
- Calculate progress
- Weak topic detection

---

# 4. Folder Structure

```text
app/
components/
docs/
prisma/
public/
tests/

src/
├── actions/
├── ai/
├── auth/
├── config/
├── constants/
├── generated/
├── hooks/
├── lib/
├── repositories/
├── server/
├── services/
├── types/
├── utils/
└── validators/
```

---

# 5. Frontend Architecture

Technology

- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui

Component Hierarchy

```text
Layout
 ├── Navbar
 ├── Sidebar
 ├── Main Content
 │     ├── Dashboard
 │     ├── Upload
 │     ├── Study Plan
 │     └── Quiz
 └── Footer
```

---

# 6. Backend Architecture

Business logic should remain independent of UI.

Layers

```text
Presentation Layer

↓

Server Actions

↓

Services

↓

Repositories (Prisma)

↓

Supabase PostgreSQL
```

Responsibilities

### Server Actions

- Handle requests
- Validate input

### Services

- Business logic
- AI orchestration

### Repository Layer

- Database access
- CRUD operations

---

# 7. Database Architecture

Primary Database

- Supabase PostgreSQL

ORM

- Prisma 6.12+

Storage

- Supabase Storage

Main Entities

- User (soft-delete, audit fields)
- Account (OAuth identity, linked to User)
- Session (unused with JWT strategy, exists for schema compat)
- VerificationToken (unused with JWT strategy, exists for schema compat)
- Syllabus (soft-delete, audit fields)
- Topic (soft-delete, audit fields)
- QuizAttempt (soft-delete, audit fields)
- PasswordResetToken (single-use, 1h expiry, SHA-256 hashed)

Audit Fields

Every User-owned entity includes:

- `createdAt` — auto-set on creation
- `updatedAt` — auto-updated on modification
- `deletedAt` — soft-delete timestamp (null = active)
- `createdBy` — User.id of the creator (nullable)
- `updatedBy` — User.id of the last modifier (nullable)

Repository Layer

The data access layer uses a BaseRepository class with generic CRUD, soft-delete, cursor pagination, and audit support.

```text
BaseRepository<T>
├── findById
├── findMany (cursor pagination, sort, filter)
├── create (audit: createdBy/updatedBy)
├── update (audit: updatedBy)
├── softDelete
├── restore
├── exists
└── count
```

Concrete repositories:

- `UserRepository` — findByEmail, findActiveByEmail, findActiveById, updatePassword, findManyWithAccounts
- `AccountRepository` — findByProvider, findByUserId, linkProvider (idempotent P2002 catch)
- `SyllabusRepository` — findByUserId, findWithTopics
- `TopicRepository` — findBySyllabusId, findByPriority
- `QuizAttemptRepository` — findByUserId, findByTopicId, getScoreStats
- `SessionRepository` — findBySessionToken, findActiveByUserId, deleteExpired, deleteByUserId

The `transaction` utility wraps `prisma.$transaction` for atomic multi-operation sequences.

Indexes

- `Account.userId` — fast user→accounts lookups
- `Session.userId` — fast user→sessions lookups
- `Topic.priority` — filtered queries on priority level
- `QuizAttempt(userId, createdAt)` — composite for user score history
- `Syllabus(userId, title)` — unique constraint prevents duplicate titles per user

Seed Strategy

The seed file creates:

- Admin user (`admin@vidya.local`) with Argon2id-hashed password
- Student user (`student@vidya.local`) with Argon2id-hashed password
- Google OAuth test user (`google@vidya.local`) with linked Account
- Sample syllabi with topics and quiz attempts for development

Relationships

```text
User ──1:N── Account (OAuth links)
User ──1:N── Session (unused with JWT)
User ──1:N── Syllabus
User ──1:N── QuizAttempt
Syllabus ──1:N── Topic
Topic ──1:N── QuizAttempt
User ──1:N── PasswordResetToken
```

---

# 8. AI Architecture

Pipeline

```text
Upload PDF

↓

Validate File

↓

Extract Text

↓

Clean Text

↓

Validate Text

↓

Prompt Builder

↓

Gemini API

↓

JSON Response

↓

Zod Validation

↓

Normalization

↓

Database

↓

Study Plan Generation

↓

Resource Recommendation

↓

Quiz Generation

↓

Progress Initialization
```

Rules

- Never trust AI output
- Always validate
- Always sanitize
- Retry transient failures
- Log failures

---

# 9. Authentication Flow

```text
Identity Model

  Canonical:    User.id (UUID) — never changes, used for all FK relationships
  OAuth:        (provider, providerAccountId) — authoritative for OAuth lookups
  Credentials:  User.email — required for email/password login
  Mutable:      User.email, User.name, User.image — updated from provider profile
```

```text
Google OAuth Flow

  signIn callback
  ↓
  1. Account.findFirst(provider, providerAccountId)
     → if found: load linked User → update email if changed → continue
  2. User.findUnique(email)
     → if found: create Account linking → continue
     → if not found: create User + Account → continue
  ↓
  Mutate user object with database UUID
  ↓
  jwt callback stores token.id = user.id
  ↓
  session callback sets session.user.id = token.id
```

```text
Credentials Flow

  authorize function
  ↓
  User.findFirst(email, deletedAt: null)
  ↓
  Verify password via Argon2id
  ↓
  Return user with database UUID
  ↓
  jwt callback stores token.id = user.id
```

No PrismaAdapter is used. Auth.js operates in JWT-only mode with manual user and account management via the signIn callback. The Account table is authoritative for OAuth identity resolution — email is a mutable profile attribute, not an identity anchor.

Password Security

- Argon2id hashing for credentials provider
- Passwords never handled directly by application code
- OAuth users receive emailVerified timestamp from trusted provider

---

# 10. File Upload Flow

```text
User selects PDF via uploadSyllabusAction (Server Action)

  ↓

PDFValidationService.validateFile()
  - MIME type check (application/pdf)
  - Extension check (.pdf)
  - File size check (≤20MB)
  - Magic bytes check (%PDF header)
  - PDF version detection
  - Duplicate name check per user

  ↓

StorageService.upload()
  - Path: {userId}/syllabi/{year}/{uuid}_{safeFileName}
  - Supabase Storage (bucket: "syllabi")
  - Upsert disabled

  ↓

ProcessingService.updateStatus(EXTRACTING)

  ↓

PDFExtractionService.extractFromBuffer()
  - pdf-parse v2 (PDFParse class)
  - Extracts text, page count, metadata
  - Handles encrypted/password-protected PDFs
  - Returns ExtractionResult with per-page text

  ↓

TextNormalizationService.normalize()
  - Unicode NFKD normalization
  - Line ending normalization (\r\n → \n)
  - Whitespace collapse
  - Smart quote replacement
  - Control character removal
  - Zero-width character removal

  ↓

ProcessingService.updateWithExtractionResult()
  - Stores rawText + pageCount in Syllabus record
  - Sets processingStatus: COMPLETED

  ↓

AuditLogService.log()
  - Structured logging for every step
  - Request ID, user ID, duration tracking
```

### Processing Status State Machine

```text
UPLOADED → EXTRACTING → COMPLETED
                          ↓
                        FAILED → (retry) → UPLOADED
```

### Services

| Service                  | Location                           | Purpose                                                   |
| ------------------------ | ---------------------------------- | --------------------------------------------------------- |
| PDFValidationService     | src/services/pdf-validation.ts     | File validation (MIME, extension, size, magic bytes)      |
| StorageService           | src/services/storage.ts            | Supabase Storage CRUD with ownership verification         |
| PDFExtractionService     | src/services/pdf-extraction.ts     | Text extraction via pdf-parse                             |
| TextNormalizationService | src/services/text-normalization.ts | Unicode/whitespace normalization                          |
| ProcessingService        | src/services/processing.ts         | Status transitions and DB updates                         |
| AuditLogService          | src/services/audit-log.ts          | Structured audit logging                                  |
| PDFUploadService         | src/services/pdf-upload.ts         | Orchestrator (validates → stores → extracts → normalizes) |

### Server Actions

| Action                    | File               | Purpose                           |
| ------------------------- | ------------------ | --------------------------------- |
| uploadSyllabusAction      | src/actions/pdf.ts | Form-based upload with validation |
| deleteSyllabusAction      | src/actions/pdf.ts | Soft-delete with storage cleanup  |
| retryProcessingAction     | src/actions/pdf.ts | Retry failed processing           |
| getSyllabusStatusAction   | src/actions/pdf.ts | Status query                      |
| getExtractionResultAction | src/actions/pdf.ts | Retrieve extracted text           |

---

# 11. Study Plan Flow

```text
Syllabus

↓

AI Topic Extraction

↓

Priority Detection

↓

Estimated Time

↓

Learning Order

↓

Study Plan

↓

Progress Tracking
```

---

# 12. Deployment Architecture

```text
Browser

↓

Vercel

↓

Next.js

↓

Prisma

↓

Supabase

↓

Gemini API
```

Production Services

- Vercel
- Supabase
- Google Gemini

---

# 13. Error Handling Strategy

Client

- Toast messages
- Friendly UI

Server

- Structured errors
- Logging
- Validation

Database

- Rollback where appropriate
- Constraint handling

AI

- Retry
- Timeout
- Validation

---

# 14. Logging Strategy

Application Logs

- Requests
- Errors
- Uploads

AI Logs

- Prompt execution
- Response validation

Security Logs

- Login attempts
- Upload failures
- Suspicious activity

---

# 15. Scalability Strategy

Application

- Modular architecture

Database

- Proper indexing

Frontend

- Lazy loading

Backend

- Stateless design

AI

- Cache repeated prompts where appropriate

Storage

- CDN-backed file delivery

---

# 16. Dashboard Architecture

The dashboard aggregates data from multiple database models into unified views for the student.

## Components

```
Server Actions (src/actions/dashboard.ts)
  → DashboardService (src/services/dashboard.ts)
    → Prisma (direct queries + $queryRaw)
    → QuizAttemptRepository
    → TopicRepository
```

## Data Flow

1. Server action authenticates the user via Auth.js session
2. DashboardService queries User, Syllabus, Topic, and QuizAttempt models
3. Study streak is computed via raw SQL for efficient date grouping
4. Syllabus progress counts completed topics (quiz score >= 70%) vs total topics
5. Recent activity merges quiz attempts and syllabus uploads into a timeline
6. DashboardData aggregates all stats into a single response

## Key Patterns

- Raw SQL (`$queryRaw`) for complex aggregations (study streak, completion counts)
- Strongly-typed return types (DashboardStats, StudyStreak, RecentActivity, etc.)
- Server actions are thin wrappers handling authentication and error formatting
- No caching in V1; Redis caching can be added for high-traffic scenarios

---

# 17. Certificate Architecture

Certificates are generated on-the-fly from quiz completion data without requiring a persistent certificate store.

## Components

```
Server Actions (src/actions/certificate.ts)
  → CertificateService (src/services/certificate.ts)
    → TopicRepository
    → QuizAttemptRepository
    → UserRepository
    → SyllabusRepository
    → crypto (SHA-256)
```

## Certificate ID Format

```
VIDYA-CERT-{userId}~{syllabusId}~{hash}
```

- `hash` = SHA-256("{userId}:{syllabusId}").slice(0, 8)
- Uses `~` separator to avoid conflicts with UUID hyphens
- Deterministic: same user + syllabus always produces the same certificate ID

## Eligibility Criteria

- 80%+ of topics in the syllabus must have quiz attempts
- Average score across all attempts must be >= 70%

## Verification Flow

1. Parse certificate ID: extract userId, syllabusId, and hash
2. Recompute expected hash from userId + syllabusId
3. Compare hashes (tamper detection)
4. Look up user and syllabus in database
5. Re-validate eligibility against current data
6. Return verification result with user details

## Key Patterns

- No database table for certificates; generated from quiz data
- Deterministic IDs enable re-generation without storage
- Real-time verification against current eligibility data
- Tamper-resistant via SHA-256 hash

---

# 18. Architecture Principles

The project follows:

- SOLID
- DRY
- KISS
- Clean Architecture
- Feature-based organization
- Separation of Concerns

Every module should have:

- Single responsibility
- Strong typing
- Testability
- Reusability

---

# Future Architecture

Planned additions

- Teacher Portal
- Parent Portal
- Mobile Application
- Notification Service
- AI Tutor Memory
- Recommendation Engine
- Real-time Collaboration
- Offline Support

---

# End of Document
