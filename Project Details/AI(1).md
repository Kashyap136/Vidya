# AI Architecture & Engineering Guide

**Project:** Vidya

**Version:** 1.0.0

**AI Provider:** Google Gemini

**Status:** Approved

---

# Table of Contents

1. Purpose
2. AI Philosophy
3. AI Objectives
4. AI Architecture
5. AI Workflow
6. Prompt Engineering Standards
7. Prompt Structure
8. Structured Output
9. AI Validation
10. AI Error Handling
11. Retry Strategy
12. Token Management
13. Cost Optimization
14. AI Security
15. AI Memory
16. AI Features
17. Future AI Roadmap
18. AI Engineering Checklist

---

# 1. Purpose

This document defines how Artificial Intelligence is integrated into Vidya.

AI is responsible for assisting students in understanding their syllabus, generating structured learning content, recommending educational resources, and creating personalized study plans.

AI assists learning.

AI does not replace learning.

---

# 2. AI Philosophy

Vidya uses AI to reduce confusion rather than replace critical thinking.

Every AI response must be:

- Helpful
- Accurate
- Structured
- Explainable
- Safe
- Relevant

AI should simplify learning without encouraging dependency.

---

# 3. AI Objectives

The AI system should:

- Understand uploaded syllabi
- Generate structured topics
- Create learning roadmaps
- Recommend quality learning resources
- Generate quizzes
- Explain difficult concepts
- Provide revision support
- Answer student questions

Future objectives

- Personalized tutoring
- Voice explanations
- AI mentor
- Adaptive learning

---

# 4. AI Architecture

```
Student

↓

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

↓

Frontend
```

---

# 5. AI Workflow

### Step 1

Extract syllabus text.

↓

### Step 2

Clean extracted text.

↓

### Step 3

Validate extracted text (length, language, structure).

↓

### Step 4

Build prompt (role, task, rules, output schema, restrictions).

↓

### Step 5

Call Gemini.

↓

### Step 6

Receive JSON.

↓

### Step 7

Validate with Zod (required fields, enums, ranges, unexpected properties).

↓

### Step 8

Normalize validated output (clamp values, sanitize strings).

↓

### Step 9

Store database.

↓

### Step 10

Generate study plan from topics.

↓

### Step 11

Recommend resources (ranked: docs > textbooks > playlists > articles > practice).

↓

### Step 12

Initialize progress tracking.

↓

### Step 13

Display results.

---

# 6. Prompt Engineering Standards

Every prompt must include

Role

↓

Task

↓

Rules

↓

Output Format

↓

Examples (if helpful)

↓

Restrictions

Never create vague prompts.

Always define:

- Expected output
- JSON schema
- Constraints
- Edge cases

---

# 7. Prompt Structure

Example

```
System Role

↓

Context

↓

User Input

↓

Requirements

↓

Output Schema

↓

Validation Rules
```

Always request JSON when structured data is expected.

---

# 8. Structured Output

Preferred format

```json
[
  {
    "title": "",
    "summary": "",
    "priority": "HIGH",
    "difficulty": 5,
    "order": 1,
    "estimatedMinutes": 45
  }
]
```

Rules

- No Markdown
- No explanations
- No code fences
- No additional text
- JSON only

---

# 9. AI Validation

Every response must pass validation.

Checks

✓ JSON syntax

✓ Required fields

✓ Enum values

✓ Integer ranges

✓ String lengths

✓ Unexpected properties

If validation fails

↓

Retry

↓

Log failure

↓

Return safe error

Never save unvalidated AI responses.

---

# 10. AI Error Handling

Handle

- Empty response
- Invalid JSON
- Timeout
- Rate limit
- API unavailable
- Hallucinated fields
- Missing fields

Never expose raw AI errors to users.

---

# 11. Retry Strategy

Retry only for transient failures.

Maximum retries

2

Backoff

Exponential

Never retry

- Invalid prompt
- Invalid JSON after validation (without rebuilding the prompt)
- Authentication errors

---

# 12. Token Management

Reduce unnecessary tokens.

Strategies

- Short prompts
- Reusable templates
- Remove duplicate context
- Compress extracted text where appropriate

Monitor

- Token usage
- Response length
- Average latency

---

# 13. Cost Optimization

Use AI only when necessary.

Avoid repeated processing by caching results where appropriate.

Examples

Do

- Parse syllabus once
- Cache generated study plans when inputs are unchanged

Avoid

- Re-parsing unchanged syllabi
- Regenerating identical quizzes unnecessarily

Track

- Requests
- Tokens
- Cost per user
- Cost per syllabus

---

# 14. AI Security

Never trust AI output.

Protect against

- Prompt Injection
- Prompt Leakage
- Jailbreak attempts
- Hallucinations

Never allow AI to

- Execute code
- Access secrets
- Modify the database directly
- Call privileged operations without application checks

Validate all outputs before use.

---

# 15. AI Memory

AI memory should include

- Completed topics
- Weak topics
- Preferred explanation style
- Learning history
- Quiz performance
- Revision history

Never store

- Passwords
- API keys
- Authentication tokens
- Sensitive personal information beyond what is necessary for the feature

---

# 16. Resource Recommendation Ranking

AI must rank resources instead of selecting randomly.

Priority order:

1. **Official Documentation** — highest authority
2. **Free Textbooks** — structured and comprehensive
3. **High Quality YouTube Playlists** — curated video content
4. **Articles** — blog posts, tutorials
5. **Practice Websites** — interactive exercises

Every resource recommendation must include:

- Title
- URL
- Type (documentation, textbook, video, article, practice)
- Relevance score (1–10)
- Brief reason for recommendation

---

# 17. Certificate Generation

Certificates are generated as **PDFs**, not images.

Certificate requirements:

- Student name
- Syllabus title
- Completion date
- Unique certificate ID
- QR code for verification (future)

Generation pipeline:

```
Student completes all topics

↓

Progress reaches 100%

↓

Generate PDF certificate

↓

Store in Supabase Storage

↓

Display on profile
```

---

# 18. AI Features

Current

✓ Syllabus Parsing

✓ Topic Generation

✓ Summary Generation

✓ Resource Recommendation (ranked)

✓ AI Chat

✓ Quiz Generation

✓ Certificate Generation (PDF)

Future

- Flashcards
- Mind Maps
- Voice Tutor
- Coding Assistant
- Interview Coach
- Career Roadmaps
- Personalized Revision Planner

---

# 19. Future AI Roadmap

Future capabilities

- Multi-model support
- Local model support
- AI quality evaluation
- Feedback loop
- Personalized tutoring
- Agentic workflows
- Study scheduling optimization
- Learning analytics

---

# 20. AI Engineering Checklist

Before production

✓ Prompt reviewed

✓ Output schema defined

✓ Zod validation implemented

✓ Error handling added

✓ Retry policy implemented

✓ Logging enabled

✓ Rate limiting configured

✓ Cost impact evaluated

✓ Prompt injection considered

✓ Performance measured

✓ Documentation updated

---

# AI Principles

AI is an assistant.

The application remains responsible for:

- Security
- Validation
- Business logic
- Database integrity
- Authorization
- User experience

If AI output conflicts with application rules, the application rules always take precedence.

---

# End of Document
