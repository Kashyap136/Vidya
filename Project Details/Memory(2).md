# Project Memory

**Project:** Vidya

**Version:** 1.0.0

**Status:** Living Document

---

# Purpose

This document serves as the long-term memory of the Vidya project.

Unlike other documentation, this file continuously evolves throughout the project's lifecycle.

Its purpose is to ensure that both developers and AI coding assistants understand:

- Why decisions were made
- Current architecture
- Completed features
- Pending work
- Known issues
- Technical debt
- Future plans

---

# Project Overview

Project Name

Vidya

Meaning

Knowledge

Project Type

AI-powered Academic Operating System

Current Version

1.0.0

Project Status

Planning Phase (Documentation Synchronization Complete)

Repository

(To be added)

Production URL

(To be added)

---

# Product Vision

Vidya transforms an academic syllabus into a structured learning experience.

Students should never ask

"What should I study next?"

Vidya should always know the answer.

---

# Core Mission

Reduce academic confusion.

Improve learning efficiency.

Provide personalized AI guidance.

Help students finish their syllabus faster.

---

# Core Technology Stack

Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js Server Actions
- Route Handlers

Database

- Supabase PostgreSQL

ORM

- Prisma

Storage

- Supabase Storage

Authentication

- Auth.js v5
- Prisma Adapter
- Google Provider
- Credentials Provider
- Argon2id password hashing

AI

- Google Gemini

Deployment

- Vercel

Testing

- Vitest
- Playwright

---

# Architecture Decisions

Decision 001

Use Next.js 16 App Router.

Reason

Modern architecture. Better Server Components.

---

Decision 002

Use Prisma.

Reason

Type-safe ORM.

---

Decision 003

Use Supabase for PostgreSQL and Storage only.

Reason

Managed PostgreSQL and file storage. Auth handled separately.

---

Decision 004

Use Auth.js v5.

Reason

Flexible authentication with Google OAuth, credentials, and Argon2id.

---

Decision 005

Use Gemini.

Reason

Structured JSON generation.

---

Decision 006

Server Actions preferred over REST APIs.

Reason

Simpler architecture.

---

Decision 007

ProcessingStatus enum instead of isProcessed boolean.

Reason

Better state machine for upload pipeline.

---

Decision 008

Dark Mode included in Version 1.

Reason

All components must support Light, Dark, and System themes.

---

Decision 009

Certificates generated as PDFs.

Reason

Printable, standard format, embeddable metadata.

---

Decision 010

Resource recommendation ranked by priority.

Reason

Higher quality learning recommendations.

---

Decision 011

Structured logging for every Server Action.

Reason

Improved debugging and observability.

---

Decision 012

Soft deletes for user-owned data.

Reason

Recoverable data, audit trail, safe deletion.

---

# Current Folder Structure

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

---

# Current Database Tables

Current

User

Syllabus

Topic

Future

Quiz

QuizQuestion

QuizAttempt

Progress

StudyPlan

Resource

Notification

RevisionSession

UserPreference

Achievement

Certificate

---

# Completed Documents

✓ PRD

✓ Architecture

✓ Database

✓ API

✓ Rules

✓ Coding Standards

✓ Security

✓ Testing

✓ Design

✓ UI Components

✓ Accessibility

✓ AI Guide

✓ Deployment

✓ Environment

✓ Decisions

✓ Roadmap

✓ Memory

✓ Phases

✓ Contributing

✓ Observability

---

# Completed Features

Current

None (pre-implementation)

---

# Planned Features

Authentication (Auth.js v5)

Dashboard

Upload

PDF Parsing

AI Processing

Study Planner

Quiz System

Progress Tracking

Certificate Generation (PDF)

AI Chat

Revision Mode

Dark Mode (Light / Dark / System)

Search

Profile

---

# Future Features

Teacher Dashboard

Parent Dashboard

Voice Tutor

Flashcards

Mind Maps

Offline Support

Study Groups

Mobile App

Desktop App

Calendar Integration

Gamification

Learning Analytics

---

# AI Decisions

Always validate AI.

Never trust AI output.

Always use Zod.

Never execute AI-generated code.

Prefer structured JSON.

Retry only transient failures.

Resource recommendation must be ranked.

---

# Security Decisions

Use Auth.js v5 (not Supabase Auth).

Use Argon2id for password hashing.

Enable RLS.

Secure cookies.

Validate uploads.

Validate AI.

Validate users.

Never expose secrets.

---

# Known Technical Debt

Current

None

Future

ProcessingStatus enum migration complete.

---

# Coding Principles

- SOLID
- DRY
- KISS
- Clean Architecture
- Type Safety
- Theme Adaptability

---

# Design Principles

Simple

Readable

Accessible

Minimal

Responsive

Student-first

Theme-adaptive (Light / Dark / System)

---

# Testing Principles

Every feature requires

Unit Tests

↓

Integration Tests

↓

E2E Tests

↓

Accessibility Review

↓

Security Review

---

# Deployment Strategy

Hosting

Vercel

Database

Supabase PostgreSQL

Storage

Supabase Storage

Authentication

Auth.js v5

Monitoring

Future

---

# Environment Variables

DATABASE_URL

DIRECT_URL

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

AUTH_SECRET

AUTH_URL

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

GEMINI_API_KEY

NEXT_PUBLIC_APP_URL

---

# Coding Preferences

Prefer

Server Components

Server Actions

Composition

Reusable Components

Small Functions

Avoid

Large Components

Business Logic in UI

Duplicated Code

---

# AI Prompt Principles

Every prompt

Defines role

↓

Defines task

↓

Defines rules

↓

Defines JSON schema

↓

Defines restrictions

↓

Defines validation

---

# Performance Goals

Home

<2s

Dashboard

<2s

API

<500ms where practical

Lighthouse

90+

---

# Accessibility Goals

WCAG 2.2 AA

Keyboard Navigation

Screen Reader Support

High Contrast

Dark Mode Contrast

Responsive

---

# Important Decisions Log

Date: July 2026

Decision: Auth.js v5 replaces Supabase Auth

Reason: More flexible auth with OAuth + credentials + Argon2id

---

Date: July 2026

Decision: ProcessingStatus enum replaces isProcessed boolean

Reason: Better state representation for the upload pipeline

---

Date: July 2026

Decision: Dark Mode is a Version 1 requirement

Reason: All components must support Light, Dark, and System themes from the start

---

Date: July 2026

Decision: Folder structure standardized across all docs

Reason: Resolved inconsistencies between Architecture.md, CodingStandards.md, and Memory.md

---

Date: July 2026

Decision: Next.js 16 replaces Next.js 14

Reason: Latest stable version with improved performance

---

Date: July 2026

Decision: Certificates as PDFs not images

Reason: Printability, standard format, embeddable metadata

---

Date: July 2026

Decision: Resource recommendation ranked by priority

Reason: Higher quality learning recommendations

---

Date: July 2026

Decision: Structured logging for every Server Action

Reason: Production observability requirement

---

Date: July 2026

Decision: Soft deletes for user-owned data

Reason: Data recovery and audit trail

---

# Current Risks

AI hallucinations

Large PDFs

Prompt Injection

API Cost

Slow Networks

Database Growth

---

# Future Research

AI Memory

Semantic Search

Vector Database

RAG

Offline AI

Adaptive Learning

---

# Future Integrations

Google Calendar

GitHub

Notion

Google Drive

Microsoft OneDrive

Slack

Discord

Email

---

# Development Workflow

Idea

↓

Discussion

↓

Documentation

↓

Architecture

↓

Implementation

↓

Testing

↓

Review

↓

Deployment

---

# Notes

This document should always reflect the current state of the project.

Whenever a major decision is made,

update this document first.

Whenever a feature is completed,

update this document.

Whenever architecture changes,

update this document.

This file should become the single source of truth for project history.

---

# End of Document
