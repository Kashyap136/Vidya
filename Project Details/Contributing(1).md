# Contributing Guide

**Project:** Vidya

**Version:** 1.0.0

**Status:** Living Document

---

# Welcome

Thank you for your interest in contributing to Vidya.

Vidya aims to become a production-quality AI-powered academic learning platform.

Every contribution should improve:

- Code Quality
- User Experience
- Security
- Performance
- Accessibility
- Documentation

---

# Table of Contents

1. Project Philosophy
2. Code of Conduct
3. Development Workflow
4. Getting Started
5. Project Setup
6. Branch Strategy
7. Commit Standards
8. Pull Request Guidelines
9. Coding Standards
10. Documentation Standards
11. Testing Requirements
12. Security Requirements
13. AI Development Rules
14. Issue Guidelines
15. Feature Request Guidelines
16. Release Workflow
17. Maintainer Responsibilities
18. Community Guidelines

---

# 1. Project Philosophy

Vidya values

- Simplicity
- Maintainability
- Reliability
- Security
- Accessibility
- Clean Architecture

Every contribution should make the project better than before.

---

# 2. Code of Conduct

Contributors should

- Be respectful
- Be professional
- Give constructive feedback
- Welcome newcomers
- Respect different opinions

Harassment or abusive behavior will not be tolerated.

---

# 3. Development Workflow

Idea

↓

Discussion

↓

Issue

↓

Branch

↓

Development

↓

Testing

↓

Pull Request

↓

Review

↓

Merge

↓

Release

---

# 4. Getting Started

Clone repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Configure environment

```bash
cp .env.example .env.local
```

Generate Prisma Client

```bash
npx prisma generate
```

Run development server

```bash
npm run dev
```

---

# 5. Project Setup

Requirements

- Node.js LTS (20+)
- npm
- Git
- Supabase Project
- Gemini API Key
- Google OAuth Credentials (Client ID + Client Secret)

Recommended Editor

Visual Studio Code

Recommended Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- Error Lens

---

# 6. Branch Strategy

Main branches

```
main

develop
```

Feature branches

```
feature/upload-pdf

feature/quiz-system

feature/dashboard
```

Bug fixes

```
fix/pdf-parser

fix/login

fix/validation
```

Documentation

```
docs/api

docs/security
```

---

# 7. Commit Standards

Use Conventional Commits.

Examples

```
feat: add syllabus upload

fix: validate pdf mime type

docs: update architecture

refactor: simplify ai parser

test: add upload integration tests

perf: optimize prisma queries

chore: update dependencies
```

---

# 8. Pull Request Guidelines

Every Pull Request must include

- Description
- Screenshots (if UI changes)
- Related Issue
- Testing Evidence
- Documentation Updates
- Breaking Changes (if any)

Checklist

✓ Build passes

✓ Tests pass

✓ Documentation updated

✓ Security considered

✓ Accessibility reviewed

---

# 9. Coding Standards

Follow

- Rules.md
- Coding-Standards.md
- Architecture.md

Never

- Disable TypeScript
- Ignore lint errors
- Commit secrets
- Duplicate code

---

# 10. Documentation Standards

Update documentation whenever

- Database changes
- API changes
- Architecture changes
- New feature added
- Environment changes

Documentation is part of the feature.

---

# 11. Testing Requirements

Every feature should include

- Unit Tests
- Integration Tests
- Manual Verification

Critical flows should include End-to-End tests.

---

# 12. Security Requirements

Every contribution should

- Validate user input
- Validate AI output
- Prevent unauthorized access
- Avoid exposing secrets
- Handle errors safely

Security regressions should block merging.

---

# 13. AI Development Rules

When modifying AI features

Always

- Validate JSON
- Update schemas
- Review prompts
- Handle retries
- Test malformed responses

Never

- Trust AI output directly
- Execute AI-generated code

---

# 14. Issue Guidelines

Every issue should include

- Title
- Description
- Expected Behavior
- Actual Behavior
- Steps to Reproduce
- Screenshots (if applicable)
- Environment Information

---

# 15. Feature Request Guidelines

Feature requests should explain

- Problem
- Proposed Solution
- Alternatives Considered
- Benefits
- Possible Drawbacks

Avoid feature requests that increase complexity without clear user value.

---

# 16. Release Workflow

Development

↓

Code Review

↓

Testing

↓

Staging

↓

QA

↓

Production

↓

Monitoring

↓

Feedback

---

# 17. Maintainer Responsibilities

Maintainers should

- Review Pull Requests
- Keep dependencies updated
- Review security issues
- Update documentation
- Manage releases
- Support contributors

---

# 18. Community Guidelines

Everyone is encouraged to

- Ask questions
- Suggest improvements
- Report bugs
- Improve documentation
- Help other contributors

We value respectful collaboration and continuous learning.

---

# Contributor Checklist

Before opening a Pull Request

✓ Code builds successfully

✓ Tests pass

✓ Lint passes

✓ Documentation updated

✓ No secrets committed

✓ Accessibility considered

✓ Security reviewed

✓ Performance considered

✓ Feature manually tested

---

# Final Philosophy

Contributing to Vidya is not only about writing code.

It is about improving the product for every student who uses it.

Every contribution, no matter how small, should leave the project in a better state than before.

---

# End of Document
