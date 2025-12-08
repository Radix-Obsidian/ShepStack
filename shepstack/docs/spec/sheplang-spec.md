# ShepLang Language Specification

## Overview

**ShepLang is an AI-native programming language for describing software products.**

A `.shep` program defines data models, views, actions, and tasks using a clean, indentation-based syntax. The ShepLang compiler transforms programs into Python (FastAPI) + TypeScript (React) + SQL (PostgreSQL).

**Key Innovation**: `ai` is a first-class language primitive — not an API, but a verb.

## Language Status

| Component | Status |
|-----------|--------|
| Lexer | ✅ Complete |
| Parser | ✅ Complete |
| Type System | ✅ Complete |
| Verification | ✅ Complete |
| Code Generation | ✅ Complete |
| `ai` Primitive | 🚧 Partial |

---

## Program Structure

A ShepLang program consists of these top-level constructs:

```shep
app "ProgramName"

data TypeName {
  # Data model definition
}

view ViewName {
  # UI component definition
}

action ActionName {
  # Business logic
}

task TaskName {
  # Background process
}
```

---

## Entities

Define data structures and relationships:

```shep
entity Company:
  fields:
    - name: text, required
    - email: email, required, unique
    - plan: enum(free, pro, enterprise)
    - createdAt: datetime, auto

entity Ticket:
  fields:
    - company: Company            # relationship
    - message: text, required
    - status: enum(open, resolved, escalated)
    - priority: number, default(1)
```

### Supported Field Types

| Type | Description |
|------|-------------|
| `text` | String |
| `number` | Integer or float |
| `money` | Decimal with currency |
| `email` | Email with validation |
| `date` | Date only |
| `datetime` | Date and time |
| `boolean` | True/false |
| `file` | File upload |
| `image` | Image upload |
| `enum(...)` | Fixed set of values |
| `EntityName` | Relationship to another entity |

---

## Screens

Define what users see:

```shep
screen Dashboard:
  kind: dashboard
  widgets:
    - stats: show Company count, Ticket count
    - recent: list Tickets where status = open, limit 10

screen TicketDetail:
  kind: detail
  entity: Ticket
  actions:
    - resolve: set status = resolved
    - escalate: set status = escalated
```

---

## Flows

Define user journeys:

```shep
flow "Company signs up":
  1. User fills form (name, email)
  2. Account created
  3. Redirect to Dashboard

flow "Handle support request":
  1. Customer submits ticket
  2. ai: categorize and route to correct team
  3. ai: draft initial response for agent review
  4. Agent reviews and sends response
```

---

## Rules

Define business logic constraints:

```shep
rule "Only admins can delete companies":
  if user.role != admin → deny delete on Company

rule "Tickets require message":
  if ticket.message is empty → show error "Message required"

rule "Auto-escalate angry customers":
  if ai(ticket.message, "sounds frustrated or threatening") → escalate
```

---

## AI Primitives

**This is Shep's differentiator.** AI is a verb in the language, not an API call.

### AI in Rules (Conditions)

```shep
rule "Auto-escalate angry customers":
  if ai(ticket.message, "sounds frustrated or threatening") → escalate

rule "Flag spam submissions":
  if ai(message, "looks like spam or marketing") → reject
```

### AI in Flows (Actions)

```shep
flow "Handle support request":
  1. Customer submits ticket
  2. ai: categorize into billing, technical, or general
  3. ai: draft initial response for agent review
  4. Agent reviews and sends
```

### AI for Field Derivation

```shep
entity Ticket:
  fields:
    - message: text, required
    - sentiment: ai("classify as positive, neutral, negative")
    - summary: ai("summarize in 1 sentence")
    - priority: ai("rate urgency 1-5 based on message")
```

### What Shep Generates for `ai()`

When you use `ai()`, Shep generates:

- ✅ LLM API call (Claude or OpenAI)
- ✅ Prompt construction with context
- ✅ Response parsing and validation
- ✅ Caching for repeated queries
- ✅ Retry logic with exponential backoff
- ✅ Error handling and fallbacks
- ✅ Cost tracking and rate limiting

**The founder writes intent. Shep handles the complexity.**

---

## Integrations

Declare external services:

```shep
integration Stripe:
  for: payments

integration SendGrid:
  for: email

integration S3:
  for: file_storage
```

---

## AI-Assisted Spec Writing (Phase 3+)

Founders can generate specs from plain English:

```bash
shep draft "I want a SaaS for dog groomers to manage appointments"
```

This generates a first-draft `.shep` file with:

- Suggested entities (Customer, Pet, Appointment, Groomer)
- Suggested screens (Dashboard, Calendar, CustomerDetail)
- Suggested flows (Book appointment, Reschedule, Cancel)
- Suggested rules (No double-booking, Require 24h notice)

The founder edits the human-readable spec, not code.

---

## Compilation

```bash
# Compile spec to code
shep compile app.shep

# Verify spec without generating
shep verify app.shep

# Generate first-draft spec from description
shep draft "description of your app"

# Watch mode with hot reload
shep dev
```

---

## Output

A single `.shep` file generates:

| Target | Output |
|--------|--------|
| **Python** | FastAPI routes, Pydantic models, SQLAlchemy ORM |
| **TypeScript** | React components, TypeScript interfaces, API client |
| **Database** | PostgreSQL schema, migrations |
| **AI** | LLM integration with prompts, caching, error handling |

---

## Design Principles

1. **Founders describe, Shep builds** — No coding required
2. **AI is a verb, not an API** — `ai()` is as natural as `if`
3. **Verification before generation** — Catch errors at compile time
4. **Generated code is real code** — Readable, modifiable, no lock-in
5. **One spec, multiple targets** — Python + TypeScript + SQL from one file

---

## Next Steps

See the [roadmap](/docs/roadmap/00-high-level.md) for implementation priorities.
