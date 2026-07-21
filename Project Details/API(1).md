# API Design Document

**Project:** Vidya

**Version:** 1.0.0

**API Style:** Next.js Server Actions + Route Handlers

**Authentication:** Auth.js v5

**Database:** Supabase PostgreSQL

---

# Table of Contents

1. Overview
2. API Design Principles
3. Authentication
4. Authorization
5. Error Handling
6. Standard Response Format
7. Validation Strategy
8. Server Actions
9. Route Handlers
10. Rate Limiting
11. File Upload API
12. AI APIs
13. Dashboard APIs
14. Profile APIs
15. Quiz APIs
16. Progress APIs
17. Logging
18. Versioning
19. Future APIs

---

# 1. Overview

Vidya primarily uses **Next.js Server Actions** for internal application logic.

Route Handlers should only be created when:

- Third-party integrations require REST endpoints.
- Webhooks are needed.
- Mobile applications need HTTP APIs.
- Public APIs are introduced.

Everything else should use Server Actions.

---

# 2. API Design Principles

Every endpoint must be:

- Secure
- Typed
- Validated
- Predictable
- Idempotent where applicable
- Easy to maintain

Never expose internal implementation details.

---

# 3. Authentication

Authentication Provider

- Auth.js v5
- Google OAuth
- Credentials (email/password)
- Argon2id password hashing

Every protected action must verify:

- User session
- User ID
- Session validity

Unauthenticated users receive:

401 Unauthorized

---

# 4. Authorization

Users can only access:

- Their own syllabi
- Their own quizzes
- Their own progress
- Their own profile

Never trust IDs received from the client.

Always verify ownership.

---

# 5. Error Handling

Return structured errors.

Example

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Unable to upload syllabus."
  }
}
```

Never expose:

- Stack traces
- Database errors
- Internal file paths
- API keys

---

# 6. Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

# 7. Validation Strategy

Client

- Basic validation

Server

- Zod validation

Database

- Prisma constraints

AI

- JSON validation
- Data sanitization

---

# 8. Server Actions

## uploadSyllabus()

Purpose

Upload syllabus.

Input

- title
- PDF

Flow

Validate

↓

Upload Storage

↓

Extract PDF

↓

Gemini

↓

Validate JSON

↓

Transaction

↓

Save Database

↓

Return syllabusId

---

## deleteSyllabus()

Delete syllabus.

Checks

- Authentication
- Ownership

---

## regenerateTopics()

Re-run AI.

---

## generateStudyPlan()

Generate roadmap.

---

## updateProgress()

Update completed topics.

---

## generateQuiz()

Generate quiz.

---

## submitQuiz()

Save answers.

---

## updateProfile()

Update user profile.

---

# 9. Route Handlers

Current

None required.

Future

/api/webhooks

/api/mobile

/api/admin

/api/public

---

# 10. Rate Limiting

Protect

- Login
- Upload
- AI generation
- Quiz generation

Suggested limits

Upload

10/hour

AI

30/hour

Login

10/minute

---

# 11. Upload API

Accepted

PDF

Maximum Size

10 MB

Validation

- MIME type
- Extension
- Empty file
- Duplicate uploads

Store

Supabase Storage

Never store PDFs inside PostgreSQL.

---

# 12. AI APIs

Pipeline

Upload

↓

Extract

↓

Prompt

↓

Gemini

↓

JSON

↓

Zod

↓

Database

Rules

Never trust AI.

Retry once on transient failures.

Reject malformed structures.

---

# 13. Dashboard APIs

Get Dashboard

Returns

- User
- Progress
- Recent uploads
- Statistics

---

Get Syllabus

Returns

- Metadata
- Topics
- Completion

---

# 14. Profile APIs

Update

- Name
- Avatar
- Preferences

Read

- Statistics
- Achievements
- Progress

---

# 15. Quiz APIs

Generate Quiz

Submit Quiz

Get Results

Retry Quiz

Quiz History

---

# 16. Progress APIs

Update Topic

Complete Topic

Revision Status

Learning Streak

---

# 17. Logging

Every Server Action must record:

- requestId — unique identifier per request
- userId — authenticated user identifier
- executionTime — total execution time in ms
- databaseLatency — database operation time in ms
- aiLatency — AI call time in ms (if applicable)
- status — success or failure
- errors — structured error details (if applicable)

Log Categories

- Application
- Authentication
- AI
- Upload
- Database
- Security

Never log

- Passwords
- JWTs
- AUTH_SECRET
- Service Role Keys
- Personal secrets

---

# 18. API Versioning

Current

v1

Future

/api/v2

Do not break existing clients.

---

# 19. Future APIs

Teacher Dashboard

Parent Dashboard

Notifications

Calendar

Study Groups

Leaderboards

AI Tutor

Voice Chat

Flashcards

Mind Maps

---

# HTTP Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

413 Payload Too Large

415 Unsupported Media Type

422 Validation Error

429 Too Many Requests

500 Internal Server Error

503 Service Unavailable

---

# Security Requirements

Every endpoint must:

✓ Authenticate user

✓ Authorize access

✓ Validate input

✓ Validate AI output

✓ Log failures

✓ Rate limit abuse

✓ Return safe errors

✓ Prevent IDOR

✓ Prevent Mass Assignment

✓ Prevent Injection attacks

---

# API Naming Rules

Use verbs for Server Actions

Examples

uploadSyllabus()

deleteSyllabus()

generateQuiz()

updateProgress()

Never use:

doSomething()

handleStuff()

processData()

---

# API Design Principles

Every API should answer:

What does it do?

Who can call it?

What validation happens?

What errors can occur?

How is it secured?

If these questions cannot be answered, the API is incomplete.

---

# End of Document
