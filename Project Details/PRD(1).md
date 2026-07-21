# Project Requirement Document (PRD)

**Project Name:** Vidya

**Version:** 1.0.0

**Document Status:** Approved

**Author:** Himanshu Kashyap

**Last Updated:** July 2026

---

# Table of Contents

1. Executive Summary
2. Vision
3. Mission
4. Product Philosophy
5. Problem Statement
6. Existing Solutions
7. Product Overview
8. Objectives
9. Scope
10. Stakeholders
11. Target Users
12. User Personas
13. User Journey
14. Functional Requirements
15. Non-functional Requirements
16. Success Metrics
17. Constraints
18. Assumptions
19. Risks
20. Future Scope

---

# 1. Executive Summary

Vidya is an AI-powered academic learning platform that transforms an unstructured university syllabus into a personalized learning roadmap.

Instead of forcing students to search through hundreds of YouTube videos, websites, PDFs, and notes, Vidya understands the uploaded syllabus and provides an organized study experience.

The platform focuses on reducing confusion and increasing productivity by recommending what to study, when to study, and how to study.

---

# 2. Vision

To become the most trusted AI-powered academic assistant that helps every student learn efficiently through structured, personalized, and intelligent learning experiences.

---

# 3. Mission

Our mission is to eliminate information overload for students by transforming complex syllabi into simple, actionable learning roadmaps using Artificial Intelligence.

---

# 4. Product Philosophy

Vidya is NOT another course platform.

Vidya does NOT replace teachers.

Vidya does NOT replace YouTube.

Vidya organizes learning.

Every feature should answer one question:

"Does this reduce confusion for the student?"

If the answer is no, the feature should be reconsidered.

---

# 5. Problem Statement

Today's students face several challenges:

- Too many learning resources
- No structured study plan
- Difficulty identifying important topics
- Poor revision planning
- Generic AI responses not aligned with university syllabi
- Lack of progress tracking

Students often spend more time deciding what to study than actually studying.

---

# 6. Existing Solutions

## YouTube

Pros

- Free
- Huge content library

Cons

- Information overload
- No syllabus awareness
- No personalized roadmap

---

## ChatGPT / Gemini

Pros

- Excellent explanations
- Interactive

Cons

- Generic responses
- Doesn't maintain long-term study progression
- No built-in syllabus management

---

## Coursera / Udemy

Pros

- High-quality courses

Cons

- Course-oriented instead of syllabus-oriented
- Often paid
- Not tailored to university exams

---

# 7. Product Overview

The student uploads a syllabus PDF.

Vidya:

1. Extracts text.
2. Understands the syllabus.
3. Identifies topics and subtopics.
4. Determines learning order.
5. Estimates study time.
6. Recommends learning resources.
7. Generates quizzes.
8. Tracks progress.
9. Creates revision plans.

---

# 8. Objectives

Primary Objectives

- Reduce study confusion.
- Save time.
- Improve exam preparation.
- Provide personalized learning.

Secondary Objectives

- Track learning progress.
- Improve retention.
- Simplify revision.

---

# 9. Scope

## Included

- Authentication (Auth.js v5, Google + Credentials, Argon2id)
- Dashboard
- PDF upload
- AI syllabus analysis
- Study plans
- Topic management
- Quiz generation
- Progress tracking
- Resource recommendation
- Revision mode
- Certificate generation (PDF)
- Dark mode (Light / Dark / System)

## Excluded (Current Version)

- Live classes
- Video hosting
- Payment gateway
- Teacher portal
- Parent portal

---

# 10. Stakeholders

Primary

- Students

Secondary

- Teachers
- Universities
- Administrators

Development

- Developers
- Designers
- Testers

---

# 11. Target Users

Primary

- B.Sc. Students
- B.Tech Students
- Diploma Students

Secondary

- Self-learners

Future

- Competitive exam aspirants
- Coaching institutes

---

# 12. User Personas

## Persona 1

Name:
Rahul

Age:
19

Goal:
Pass semester exams.

Pain Points

- Doesn't know what to study.
- Watches random videos.
- Poor time management.

Needs

- Clear roadmap.
- Best resources.
- Revision plan.

---

# 13. User Journey

Landing Page

↓

Sign Up

↓

Dashboard

↓

Upload Syllabus

↓

AI Processing

↓

Study Plan

↓

Learning

↓

Quiz

↓

Progress Tracking

↓

Revision

↓

Exam Ready

---

# 14. Functional Requirements

Authentication

- Register
- Login
- Logout
- Password Reset

Dashboard

- Upload syllabus
- View study plans
- View progress

AI

- Parse syllabus
- Explain topics
- Generate summaries
- Generate quizzes

Learning

- Topic roadmap
- Resource recommendations
- Revision mode

Profile

- Learning statistics
- Completed topics
- Quiz history

---

# 15. Non-functional Requirements

Performance

- Fast page loads
- Efficient database queries

Security

- Input validation
- Secure authentication
- Secure file uploads

Scalability

- Support thousands of users

Accessibility

- WCAG compliant

Reliability

- High uptime

Maintainability

- Modular architecture

---

# 16. Success Metrics

- Daily Active Users
- Weekly Active Users
- Quiz Completion Rate
- Average Study Time
- Syllabus Completion Rate
- User Retention
- Error Rate

---

# 17. Constraints

- AI responses are probabilistic.
- Uploaded PDFs may be poorly formatted.
- Internet connection required.
- Gemini API limits apply.

---

# 18. Assumptions

- Users upload valid syllabi.
- Users have internet access.
- AI APIs remain available.
- Supabase remains operational.

---

# 19. Risks

Technical

- AI hallucinations
- PDF parsing failures
- Database failures

Business

- Low user adoption

Security

- Malicious PDF uploads
- Prompt injection
- Abuse of AI endpoints

---

# 20. Future Scope

- AI Flashcards
- AI Mind Maps
- Teacher Dashboard
- Parent Dashboard
- Mobile Applications
- Offline Study Mode
- Multi-language Support
- Collaborative Study Groups
- AI Performance Analytics
- Interview Preparation
- Placement Preparation

---

# Document Approval

| Role          | Name             | Status  |
| ------------- | ---------------- | ------- |
| Product Owner | Himanshu Kashyap | Pending |
| Architect     | TBD              | Pending |
| Developer     | TBD              | Pending |

---

**End of Document**
