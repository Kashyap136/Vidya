# Engineering Rules & Development Standards

**Project:** Vidya

**Version:** 1.0.0

**Purpose:**
This document defines the mandatory engineering rules, development standards, coding principles, security requirements, AI development guidelines, Git workflow, and review process for the Vidya project.

Every developer and AI coding assistant must follow these rules.

---

# Table of Contents

1. Core Principles
2. General Rules
3. Coding Standards
4. Architecture Rules
5. Database Rules
6. API Rules
7. AI Rules
8. UI/UX Rules
9. Security Rules
10. Performance Rules
11. Git Workflow
12. Code Review Checklist
13. Pull Request Rules
14. Documentation Rules
15. Testing Rules
16. Deployment Rules
17. Prohibited Practices
18. Engineering Philosophy

---

# 1. Core Principles

Every feature should satisfy these principles:

- Simplicity
- Maintainability
- Security
- Scalability
- Testability
- Accessibility

Every implementation must answer:

- Why does this exist?
- Can it scale?
- Can another developer understand it?
- Is it secure?
- Is it testable?

---

# 2. General Rules

Always

- Use TypeScript Strict Mode.
- Keep functions small.
- Prefer composition over inheritance.
- Use reusable components.
- Keep files focused on one responsibility.

Never

- Commit secrets.
- Ignore TypeScript errors.
- Disable ESLint rules without justification.
- Copy large blocks of duplicated code.

---

# 3. Coding Standards

Naming

Variables

camelCase

Functions

camelCase

Components

PascalCase

Interfaces

PascalCase

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

Files

kebab-case.ts

Folders

kebab-case

---

Functions

Good

- Single responsibility
- Small
- Pure where possible

Avoid

- Functions longer than ~50 lines without a good reason.
- Nested logic deeper than 3 levels.

---

Comments

Write comments only when explaining **why**, not **what**.

Bad

```ts
count++;
```

Good

```ts
// Retry once because Gemini occasionally returns transient errors.
```

---

# 4. Architecture Rules

Use layered architecture.

```text
UI

↓

Server Actions

↓

Services

↓

Repositories

↓

Prisma

↓

Supabase
```

Never

- Put database logic inside React components.
- Put AI prompts inside UI components.
- Put business logic inside pages.

---

# 5. Database Rules

Use Prisma.

Never write raw SQL unless performance requires it.

Every table must have

- Primary Key
- Timestamps
- Constraints
- Indexes where appropriate

Always

- Validate ownership.
- Use transactions for database-only operations.
- Handle unique constraints.

Never

- Trust client IDs.
- Delete production data without authorization.

---

# 6. API Rules

Every Server Action must

- Authenticate
- Authorize
- Validate input
- Handle errors
- Return typed responses

Return format

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
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

# 7. AI Rules

Never trust AI output.

Every response must

- Validate with Zod
- Sanitize
- Remove unexpected fields
- Clamp numeric values
- Reject invalid structures

Never

- Execute AI-generated code.
- Save AI output without validation.

Prompts should

- Be deterministic where possible.
- Produce JSON when structured data is required.
- Include explicit output constraints.

---

# 8. UI/UX Rules

Every screen must have

- Loading state
- Empty state
- Error state
- Success state

Responsive

- Mobile
- Tablet
- Desktop

Accessibility

- Keyboard navigation
- Focus indicators
- Semantic HTML
- ARIA attributes where necessary

Theming

- Light mode
- Dark mode
- System preference

---

# 9. Security Rules

Follow OWASP Top 10.

Protect against

- SQL Injection
- XSS
- CSRF
- IDOR
- SSRF
- Command Injection
- Prompt Injection
- File Upload attacks

Always

- Validate MIME type
- Validate file size
- Escape output where appropriate
- Store secrets in environment variables
- Enable HTTPS
- Use secure cookies

Never

- Expose stack traces
- Log passwords
- Log tokens
- Hardcode secrets

---

# 10. Performance Rules

Optimize

- Images
- Database queries
- Bundle size
- AI calls

Use

- Pagination
- Lazy loading
- Dynamic imports
- Memoization only when justified

Avoid

- N+1 queries
- Unnecessary re-renders
- Large client bundles

---

# 11. Git Workflow

Main Branches

main

develop

Feature Branch

feature/upload-syllabus

Bug Fix

fix/pdf-parser

Commits

Use Conventional Commits

Examples

feat: add syllabus upload

fix: validate pdf mime type

docs: update architecture

refactor: simplify topic parser

---

# 12. Code Review Checklist

Reviewers must verify

- Code compiles
- Tests pass
- Types are correct
- No duplicated logic
- Proper error handling
- Security considered
- Performance acceptable
- Documentation updated

---

# 13. Pull Request Rules

Every PR must include

- Description
- Screenshots (if UI changes)
- Test evidence
- Related issue
- Breaking changes (if any)

Small PRs are preferred over large ones.

---

# 14. Documentation Rules

Every major feature must update

- Architecture.md
- API.md
- Database.md (if schema changes)
- Memory.md
- README.md (if setup changes)

Documentation is part of the feature.

---

# 15. Testing Rules

Minimum requirements

- Unit tests for business logic
- Integration tests for Server Actions
- End-to-end tests for critical user flows

Critical flows

- Login
- Upload syllabus
- AI processing
- Quiz generation
- Progress update

---

# 16. Deployment Rules

Before deployment

- Build succeeds
- Tests pass
- Environment variables validated
- Database migrations reviewed
- No secrets committed

Production deployments should be reversible.

---

# 17. Prohibited Practices

Never

- Use `any` without documented justification.
- Ignore promise rejections.
- Disable validation.
- Trust client-provided data.
- Mix UI and business logic.
- Store files in the database.
- Commit `.env` files.
- Push directly to `main`.

---

# 18. Engineering Philosophy

Vidya is not a hackathon prototype.

It is a production-quality software project.

Every line of code should be

- Secure
- Readable
- Maintainable
- Tested
- Documented
- Scalable

When choosing between a quick solution and a maintainable solution, choose maintainability unless there is a compelling reason not to.

---

# Final Rule

If a change improves functionality but reduces security, maintainability, accessibility, or code quality, it must be reconsidered.

The long-term health of the project takes priority over short-term convenience.

---

# End of Document
