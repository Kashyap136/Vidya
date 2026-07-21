# Database Design Document

**Project:** Vidya

**Version:** 1.0.0

**Database:** Supabase PostgreSQL

**ORM:** Prisma

---

# Table of Contents

1. Overview
2. Design Principles
3. Database Technologies
4. Entity Relationship Overview
5. Current Database Schema
6. Entity Details
7. Relationships
8. Indexing Strategy
9. Constraints
10. Data Validation
11. Transactions
12. Migration Strategy
13. Seed Strategy
14. Storage Strategy
15. Security
16. Backup & Recovery
17. Performance Optimization
18. Future Database Roadmap

---

# 1. Overview

Vidya uses **Supabase PostgreSQL** as its primary relational database and **Prisma ORM** as the data access layer.

The database is designed with the following goals:

- Normalize data appropriately
- Maintain referential integrity
- Prevent duplicate or inconsistent records
- Scale for thousands of concurrent users
- Keep queries predictable and efficient

---

# 2. Design Principles

- UUID primary keys
- Strong foreign key relationships
- Cascading deletes where appropriate
- Indexed foreign keys
- Minimal data duplication
- Explicit constraints
- Immutable audit timestamps
- ORM-first development using Prisma

---

# 3. Technologies

Database

- Supabase PostgreSQL

ORM

- Prisma ORM

Connection

- DATABASE_URL
- DIRECT_URL

Storage

- Supabase Storage

Authentication

- Auth.js v5 (handled outside of database config)

---

# 4. Entity Relationship Overview

```text
User
 │
 ├─────────────┐
 │             │
 ▼             ▼
Syllabus     Settings (Future)
 │
 ▼
Topic
 │
 ├─────────────┐
 ▼             ▼
Quiz       Progress
```

---

# 5. Current Schema

## User

Purpose

Represents an authenticated student.

Fields

- id
- email
- name
- image
- emailVerified
- createdAt
- updatedAt
- deletedAt (nullable, for soft deletes)

Relationships

- One User → Many Syllabi
- One User → Many QuizAttempts

---

## Syllabus

Purpose

Stores uploaded syllabus metadata and extracted text.

Fields

- id
- title
- rawText
- processingStatus (enum: UPLOADED | EXTRACTING | PARSING | GENERATING | COMPLETED | FAILED)
- filePath
- userId
- createdAt
- updatedAt
- deletedAt (nullable, for soft deletes)

Relationships

- Belongs to User
- Has many Topics

Notes

- rawText stores extracted PDF content.
- Uploaded PDF itself is stored in Supabase Storage.
- Only the storage path should be stored in future versions.

---

## Topic

Purpose

Stores AI-generated structured topics.

Fields

- id
- title
- summary
- priority
- difficulty
- order
- estimatedMinutes
- syllabusId
- createdAt
- updatedAt
- deletedAt (nullable, for soft deletes)

Relationships

- Belongs to Syllabus

---

# 6. Future Tables

The MVP intentionally keeps the schema small.

Future versions should introduce:

## StudyPlan

Stores personalized schedules.

Possible fields

- id
- syllabusId
- totalDays
- generatedAt

---

## Quiz

Stores quiz metadata.

---

## QuizQuestion

Stores generated questions.

---

## QuizAttempt

Stores each user attempt.

---

## Progress

Stores learning progress.

---

## RevisionSession

Tracks revision history.

---

## Resource

Stores curated learning resources.

---

## Notification

Stores reminders and alerts.

---

## UserPreference

Stores language, theme, AI settings.

---

# 7. Relationships

Current

```text
User
 1
 │
 │
 N
Syllabus
 1
 │
 │
 N
Topic
```

Future

```text
User

↓

Syllabus

↓

Study Plan

↓

Topic

↓

Quiz

↓

Quiz Attempt

↓

Progress
```

---

# 8. Indexing Strategy

Current

User

- email UNIQUE

Syllabus

- userId INDEX
- userId + title UNIQUE

Topic

- syllabusId INDEX

Future

StudyPlan

- syllabusId INDEX

Quiz

- topicId INDEX

Progress

- userId INDEX

---

# 9. Constraints

## Unique

```text
(userId, title)
```

Reason

Avoid duplicate syllabus names for a single user.

---

## Foreign Keys

Every foreign key must reference a valid parent.

No orphan records allowed.

---

## Soft Delete

Deleting a User sets:

- `User.deletedAt` to current timestamp
- `Syllabus.deletedAt` to current timestamp
- `Topic.deletedAt` to current timestamp

Hard deletes are not permitted for user-owned data.

---

# 10. Data Validation

Frontend

- Required fields
- File validation

Backend

- Zod validation
- Business validation

Database

- Prisma schema constraints

AI

- Validate AI JSON before insert.

---

# 11. Transactions

Use Prisma transactions only for database operations.

Good Example

```text
Update syllabus

+

Insert topics

+

Commit
```

Never include:

- Gemini API
- PDF parsing
- File upload

inside a transaction.

---

# 12. Migration Strategy

Development

```bash
npx prisma migrate dev
```

Production

```bash
npx prisma migrate deploy
```

Never modify applied migrations.

Always create new migrations.

---

# 13. Seed Strategy

A deterministic seed should include:

User

```text
Email

dev@vidya.local
```

UUID

```text
11111111-1111-1111-1111-111111111111
```

Purpose

Development only.

---

# 14. Storage Strategy

Supabase Storage

Bucket

```text
syllabi
```

Rules

- PDFs only
- Virus scan (future)
- MIME validation
- Size validation
- Randomized file names

Database stores

- Storage path
- Original filename
- Upload timestamp

---

# 15. Security

Never expose:

- DATABASE_URL
- DIRECT_URL
- Service role key

Enable

- Row Level Security
- Least privilege
- Secure API keys

Validate

- MIME type
- File size
- PDF signature where practical

Prevent

- SQL Injection
- IDOR
- Path Traversal

---

# 16. Backup & Recovery

Use Supabase backups.

Requirements

- Daily backups
- Point-in-time recovery (if available)
- Migration history in Git

---

# 17. Performance Optimization

Indexes

- Frequently queried columns

Pagination

- Cursor-based where appropriate

Queries

- Select only required fields

Avoid

- N+1 query problems
- Over-fetching

---

# 18. Soft Deletes & Audit Fields

Soft deletes are used for user-owned entities.

Tables with soft deletes include a `deletedAt DateTime?` field.

Queries must filter `WHERE deletedAt IS NULL` by default.

## Audit Fields

Every entity includes:

- `createdAt` — timestamp of creation
- `updatedAt` — timestamp of last update
- `deletedAt` — nullable, timestamp of soft delete

Future additions

- Audit logs
- Version history
- Analytics tables
- Event tables
- Search indexing

---

# Database Design Principles

Every table must answer:

1. Why does it exist?

2. Who owns the data?

3. How is it queried?

4. How does it scale?

5. How is it secured?

If a table cannot answer these questions, its design should be reconsidered.

---

# End of Document
