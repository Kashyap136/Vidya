# UI Components Specification

**Project:** Vidya

**Version:** 1.0.0

**Status:** Approved

---

# Table of Contents

1. Purpose
2. Design Philosophy
3. Component Architecture
4. Global Component Rules
5. Layout Components
6. Navigation Components
7. Form Components
8. Feedback Components
9. Data Display Components
10. Dashboard Components
11. Learning Components
12. Quiz Components
13. Profile Components
14. Accessibility Requirements
15. Responsive Behaviour
16. Performance Guidelines
17. Component Development Checklist

---

# 1. Purpose

This document defines every reusable UI component used in Vidya.

Goals

- Consistency
- Reusability
- Accessibility
- Maintainability
- Scalability

---

# 2. Design Philosophy

Every component should:

- Solve one problem.
- Be reusable.
- Be responsive.
- Be accessible.
- Have predictable behavior.
- Support loading, success and error states.

---

# 3. Component Architecture

Every component belongs to one category.

```text
Layout

Navigation

Forms

Feedback

Data Display

Learning

Quiz

Profile

Utilities
```

Never create duplicate components.

---

# 4. Global Component Rules

Every component should support:

✓ Light Mode

✓ Dark Mode

✓ Disabled State

✓ Loading State

✓ Keyboard Navigation

✓ Focus Ring

✓ Responsive Layout

✓ Accessibility Labels

---

# Naming

Good

```
UploadCard

ProgressCard

TopicCard

StudyTimeline

QuizQuestionCard
```

Bad

```
Card1

NewCard

Temp

Widget
```

---

# 5. Layout Components

## AppLayout

Purpose

Main application layout.

Contains

- Sidebar
- Header
- Content
- Footer

---

## DashboardLayout

Purpose

Dashboard pages.

Contains

Statistics

↓

Quick Actions

↓

Recent Activity

↓

Study Plan

---

## AuthLayout

Purpose

Login

Register

Forgot Password

---

# 6. Navigation Components

Navbar

Sidebar

Breadcrumb

Pagination

Tabs

Drawer

Dropdown

Search Bar

Notifications

Profile Menu

Rules

Navigation should always indicate:

Current page

Current section

Current syllabus

---

# 7. Form Components

## Button

Variants

Primary

Secondary

Ghost

Outline

Destructive

States

Hover

Focus

Loading

Disabled

---

## Input

Support

Text

Email

Password

Search

Validation

Required

Error

Helper Text

---

## Textarea

---

## Select

---

## Checkbox

---

## Radio Group

---

## Switch

---

## File Upload

Supports

Drag & Drop

Browse

Progress

Validation

Cancel Upload

Retry

---

# 8. Feedback Components

Toast

Alert

Banner

Modal

Dialog

Confirm Dialog

Skeleton Loader

Spinner

Progress Indicator

Rules

Never leave users without feedback.

---

# 9. Data Display Components

Card

Table

Badge

Avatar

Timeline

Accordion

List

Empty State

Statistics Card

Charts (Future)

---

# 10. Dashboard Components

Progress Card

Study Streak

Upcoming Tasks

Weak Topics

Recommended Resources

Learning Calendar (Future)

Daily Goal

Completion Chart

Study Statistics

Recent Uploads

Quick Actions

---

# 11. Learning Components

Topic Card

Topic Details

Topic Progress

Learning Timeline

Study Plan

Resource Card

Video Card

Article Card

Flashcard (Future)

Mind Map (Future)

Revision Card

---

# 12. Quiz Components

Question Card

Answer Options

Progress Indicator

Score Card

Result Summary

Quiz History

Retry Button

Leaderboard (Future)

---

# 13. Profile Components

Profile Card

Statistics

Achievements

Settings

Preferences

Learning History

Certificates

Account Security

---

# 14. Accessibility

Every component must

Support keyboard navigation

Support screen readers

Provide labels

Provide focus visibility

Avoid color-only communication

Meet WCAG 2.2 AA

---

# 15. Responsive Behaviour

Desktop

Full Layout

Tablet

Compact Sidebar

Mobile

Drawer Navigation

Cards become full width.

Tables become scrollable or transform into cards.

---

# 16. Performance

Avoid unnecessary renders.

Lazy-load heavy components.

Virtualize long lists where appropriate.

Use Server Components unless client-side interactivity is required.

---

# Component Folder Structure

```
components/
├── layout/
├── navigation/
├── forms/
├── feedback/
├── dashboard/
├── learning/
├── quiz/
├── profile/
├── shared/
└── ui/ (shadcn/ui primitives)
```

---

# Component Development Checklist

Before creating a component verify

✓ Is a similar component already available?

✓ Can it be reused?

✓ Is it accessible?

✓ Is it responsive?

✓ Does it support loading?

✓ Does it support error states?

✓ Does it support dark mode?

✓ Is it documented?

✓ Has it been tested?

---

# Component Philosophy

Every component should have one responsibility.

Small reusable components are preferred over large, complex components.

Design for reuse before writing code.

---

# Future Components

AI Chat Widget

Study Timer

Pomodoro Timer

Voice Assistant

AI Notes

AI Summary Card

Study Analytics

Goal Tracker

Calendar Planner

Notification Center

Teacher Dashboard Widgets

Parent Dashboard Widgets

Offline Sync Status

---

# End of Document
