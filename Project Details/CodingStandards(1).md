# Coding Standards

**Project:** Vidya

**Version:** 1.0.0

**Purpose:**
This document defines the coding standards for the Vidya project. Every developer and AI coding assistant must follow these standards to ensure consistency, maintainability, readability, security, and scalability.

---

# Table of Contents

1. Introduction
2. General Principles
3. Project Structure
4. Naming Conventions
5. TypeScript Standards
6. React Standards
7. Next.js Standards
8. Server Actions Standards
9. Database Standards
10. API Standards
11. Error Handling
12. Logging
13. Environment Variables
14. Security Coding Practices
15. Performance Guidelines
16. Documentation Standards
17. Git Standards
18. Code Review Checklist

---

# 1. Introduction

Every line of code should be:

- Readable
- Predictable
- Testable
- Reusable
- Secure

Code is read far more often than it is written.

Optimize for readability first.

---

# 2. General Principles

Follow:

- SOLID
- DRY
- KISS
- YAGNI
- Separation of Concerns

Avoid premature optimization.

---

# 3. Project Structure

```
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

Each folder has one responsibility.

---

# 4. Naming Conventions

## Variables

Good

```ts
userProfile;
studyPlan;
topicCount;
```

Bad

```ts
x;
data;
temp;
obj;
```

---

## Functions

Use verbs.

Good

```ts
uploadSyllabus();

generateQuiz();

parseSyllabus();

calculateProgress();
```

Bad

```ts
process();

handle();

run();

doThing();
```

---

## Components

PascalCase

```
DashboardCard

StudyTimeline

QuizResultCard
```

---

## Files

Use kebab-case.

```
study-plan-card.tsx

upload-syllabus.ts

progress-chart.tsx
```

---

## Constants

```
MAX_UPLOAD_SIZE

DEFAULT_LANGUAGE

MAX_AI_RETRIES
```

---

# 5. TypeScript Standards

Always use strict mode.

Never disable TypeScript.

Avoid

```ts
any;
```

Prefer

```ts
unknown;
```

or proper interfaces.

Always define interfaces or types.

Example

```ts
interface Topic {
  id: string;
  title: string;
  priority: Priority;
}
```

---

# 6. React Standards

Prefer Server Components.

Use Client Components only when necessary.

Examples:

Use Client Components for:

- Forms
- Dialogs
- Drag and Drop
- Animations
- Local State

Everything else should remain Server Components.

---

Hooks

Create custom hooks only when logic is reused.

---

Props

Never pass huge prop chains.

Use composition instead.

---

# 7. Next.js Standards

Use App Router.

Prefer:

Server Actions

Server Components

Streaming

Dynamic Imports

Avoid unnecessary client-side rendering.

---

# 8. Server Actions

Every Server Action must

Authenticate

↓

Authorize

↓

Validate

↓

Business Logic

↓

Database

↓

Return Typed Response

Never return raw database errors.

---

# 9. Database Standards

Use Prisma.

Never build SQL strings manually.

Every query should

- Request only required fields.
- Use indexes.
- Avoid N+1 queries.

Transactions

Database only.

Never include

- AI
- File Upload
- HTTP Calls

inside a transaction.

---

# 10. API Standards

Return

```json
{
  "success": true,
  "data": {}
}
```

or

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

Use meaningful error codes.

---

# 11. Error Handling

Use

try

↓

catch

↓

Log

↓

Return Safe Error

Never expose

- Stack traces
- SQL errors
- Internal paths

---

# 12. Logging

Log

- Uploads
- AI failures
- Database failures
- Login attempts

Never log

Passwords

Tokens

Secrets

API Keys

Personal data

---

# 13. Environment Variables

All secrets belong in

```
.env.local
```

Never commit

```
.env
```

Validate environment variables during application startup.

---

# 14. Security Coding Practices

Validate

Every request

↓

Every file

↓

Every AI response

↓

Every database write

Escape user-generated content before rendering where applicable.

Use parameterized queries via Prisma.

---

# 15. Performance

Optimize

- Images
- Queries
- Bundle Size
- Rendering
- AI Calls

Avoid

Large Components

Large Context Providers

Unnecessary State

Repeated Queries

---

# 16. Documentation Standards

Every exported function should have documentation when the purpose is not obvious.

Complex algorithms must explain:

- Why
- Inputs
- Outputs
- Limitations

---

# 17. Git Standards

Commit Messages

```
feat:

fix:

docs:

test:

refactor:

perf:

chore:
```

Example

```
feat: implement syllabus upload

fix: validate uploaded pdf mime type

docs: update database documentation
```

---

# 18. Code Review Checklist

Before merging verify:

✓ TypeScript passes

✓ ESLint passes

✓ Tests pass

✓ Documentation updated

✓ No duplicated code

✓ Security considered

✓ Performance acceptable

✓ Accessibility maintained

✓ Responsive design verified

✓ Error handling implemented

✓ Loading states implemented

✓ Empty states implemented

✓ Success states implemented

✓ Proper validation

✓ AI responses validated

✓ Environment variables documented

---

# Final Philosophy

Good code works.

Great code is:

- Easy to understand
- Easy to modify
- Easy to test
- Easy to secure
- Easy to scale

Optimize for the developer who will maintain this code one year from now.

That developer might be you.

---

# End of Document
