# Shep Philosophy

## What Shep Is

**Shep is a code generator for non-technical founders.**

Founders describe their product in a structured specification. Shep generates production-ready Python (FastAPI) + TypeScript (React) + database schemas.

**One spec → Full-stack working application**

### The AI Differentiator

Shep is the **first spec language with AI built in as a primitive**. AI is not an integration — it's a verb in the language.

```shep
rule "Auto-escalate angry customers":
  if ai(ticket.message, "sounds frustrated") → escalate
```

Founders describe AI intent in plain English. Shep handles prompts, API calls, caching, and error handling.

---

## Core Principles

### 1. Founders Describe, Developers Build

Shep is designed for **non-technical founders and designers** who think in terms of:

- What data exists (entities)
- What screens users see
- What flows users follow
- What rules must be enforced

Shep translates this intent into working code that developers can read, modify, and extend.

### 2. Specification-First Development

The spec is the source of truth. It describes:

- **Entities**: What data the app manages
- **Screens**: What users see and interact with
- **Flows**: How users move through the app
- **Rules**: What constraints must be enforced
- **Integrations**: What external services are used

The spec is written in plain English-like syntax, not code.

### 3. One Spec, Multiple Targets

A single `.shep` file generates:

- **Python backend** (FastAPI + Pydantic + SQLAlchemy)
- **TypeScript frontend** (React + routing)
- **Database schema** (PostgreSQL)
- **API contracts** (types match everywhere)

This eliminates duplication and keeps frontend and backend in sync.

### 4. Verification-First Compilation

Before generating code, Shep verifies:

- ✅ All entities are valid
- ✅ All screens reference valid entities
- ✅ All flows reference valid screens
- ✅ All rules are consistent
- ✅ Frontend and backend types match
- ✅ No orphaned fields or screens

**If the spec compiles, the code works.**

### 5. Generated Code Is Real Code

Shep doesn't create proprietary runtime code. It generates:

- Idiomatic Python (FastAPI, Pydantic, SQLAlchemy)
- Idiomatic TypeScript (React, standard patterns)
- Standard SQL (PostgreSQL)

Developers can read, modify, and extend the generated code. There's no lock-in.

### 6. AI Is a Verb, Not an Integration

Most tools treat AI as an external API you have to wire up. In Shep, AI is a **language primitive**:

- **In rules**: `if ai(message, "sounds frustrated") → escalate`
- **In flows**: `ai: categorize and route to correct team`
- **In fields**: `sentiment: ai("classify as positive, neutral, negative")`

The founder writes intent. Shep generates:

- LLM API calls (Claude/OpenAI)
- Prompt construction with context
- Caching for repeated queries
- Retry logic and error handling
- Cost tracking and rate limiting

**AI behavior is visible in the spec, not buried in code.**

### 7. AI-Assisted Spec Writing

Founders can generate first-draft specs from plain English:

```bash
shep draft "I want a SaaS for dog groomers to manage appointments"
```

This creates a `.shep` file with suggested entities, screens, flows, and rules. The founder edits the human-readable spec — not code.

### 8. Incremental Adoption

Shep works for:

- **Greenfield projects**: Start with a spec, generate everything
- **Existing codebases**: Migrate pieces incrementally
- **Hybrid approaches**: Mix generated and hand-written code

---

## Design Goals

### Enable Non-Technical Founders to Build

Founders shouldn't need to hire developers to validate their idea. Shep lets them:

- Describe their product in plain English
- Get working code in hours, not weeks
- Deploy to real infrastructure
- Iterate based on user feedback

### Generate Production-Ready Code

Generated code must be:

- **Idiomatic**: Follows Python/TypeScript conventions
- **Performant**: No unnecessary overhead
- **Secure**: Built-in validation and error handling
- **Testable**: Generated tests included
- **Deployable**: Works on standard infrastructure

### Catch Errors at Compile Time

The verification engine catches:

- Type mismatches
- Constraint violations
- Wiring errors
- Missing integrations

**Errors are caught before code is generated, not after deployment.**

### Reduce Time to Market

From idea to deployed product:

- **Traditional**: 6-12 weeks (hire dev, build, test, deploy)
- **With Shep**: 1-2 days (write spec, generate, deploy)

---

## What Shep Is NOT

- **Not a visual builder**: No drag-and-drop. You write structured specs.
- **Not a framework**: Shep generates code that uses standard frameworks (FastAPI, React).
- **Not a platform**: Generated code runs on your infrastructure (Vercel, Railway, AWS).
- **Not a database**: Shep generates schemas for standard databases (PostgreSQL).
- **Not a magic bullet**: You still need to understand your product and business logic.

---

## The Golden Sheep Methodology

Shep is built on the **Golden Sheep AI Methodology**:

1. **Vertical Slice Delivery**: Build one complete feature at a time (spec → code → deploy)
2. **Full-Stack Reality Testing**: Test with real services, real data, real deployments
3. **Integration-First Verification**: Verify wiring before shipping
4. **Verification-First Architecture**: Catch errors at compile time

This methodology is only possible because Shep enforces it at the language level.

---

## Target Users

### ✅ Non-Technical Founders

You want to build a real SaaS product without hiring a dev team. Shep lets you:

- Describe your product
- Get working code
- Deploy and iterate

### ✅ Solo Developers

You're tired of boilerplate and integration hell. Shep gives you:

- 6-12x speed multiplier
- Focus on product logic, not wiring
- Real code you can modify

### ✅ Small Teams (2-5 people)

You need to ship fast without breaking things. Shep provides:

- Rapid iteration
- Zero integration bugs
- Type safety across the stack

---

## Future Vision

In the long term, Shep aims to:

- Support additional targets (Go, Rust, mobile)
- Provide a marketplace of templates and integrations
- Enable teams to collaborate on specs
- Build a community of founders using Shep
- **Become the standard for AI-native application specs**

### The Vision: Founder ↔ AI ↔ Spec ↔ Code

```text
Founder describes product in plain English
    ↓
AI generates first-draft .shep spec
    ↓
Founder edits human-readable spec
    ↓
Shep verifies and generates code
    ↓
Deploy to production
```

**The founder never writes Python, TypeScript, or SQL. The founder never integrates APIs. The founder describes, and Shep builds.**
