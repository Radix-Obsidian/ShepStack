# ShepLang Philosophy

## What ShepLang Is

**ShepLang is an AI-native programming language for describing software products.**

It has first-class concepts like `app`, `data`, `view`, `action`, and `task`, plus `ai` as a built-in verb. A ShepLang program compiles to Python + JavaScript services (via ShepThon) with auth, admin, and APIs generated automatically.

**Both humans and LLMs can read and write ShepLang.**

### Why a New Language?

Existing approaches fail in different ways:

| Approach | Problem |
|----------|---------|
| Python/JS | Too low-level, too much boilerplate |
| No-code builders | Locked in, limited, can't customize |
| YAML/JSON configs | No semantics, no verification |
| DSLs | Usually incomplete, poor tooling |

ShepLang is designed from the ground up to be:
- **Writable by AI** — Structured, unambiguous syntax
- **Readable by humans** — Clear domain concepts
- **Verifiable** — Strong type system, static analysis
- **Compilable** — Real code generation, not interpretation

### The AI Primitive

ShepLang is the **first programming language with AI as a built-in verb**.

```shep
action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
  }
}
```

AI is not an API integration. It's a language construct with defined semantics.

---

## Language Design Principles

### 1. Domain-Specific Concepts

ShepLang has six top-level constructs:

| Construct | Purpose |
|-----------|---------|
| `app` | Program declaration and metadata |
| `data` | Data model definitions (like structs/classes) |
| `view` | UI component definitions |
| `action` | Business logic and mutations |
| `task` | Background/scheduled processes |
| `ai` | AI-powered computation |

These map directly to how software products are structured.

### 2. Static Verification

Before compilation, ShepLang verifies:

- ✅ All types are consistent
- ✅ All references resolve
- ✅ All constraints are satisfiable
- ✅ No dead code or orphaned definitions
- ✅ AI prompts have valid structure

**If the program compiles, the generated code works.**

### 3. Multi-Target Compilation

A single `.shep` program compiles to:

- **ShepThon** → Python (FastAPI + Pydantic)
- **ShepLang-JS** → TypeScript (React + types)
- **ShepSQL** → PostgreSQL (schema + migrations)

The compiler ensures type consistency across all targets.

### 4. Idiomatic Output

Generated code follows best practices:

- Python: PEP 8, type hints, async/await
- TypeScript: ESLint rules, strict mode
- SQL: Proper normalization, indexes

Developers can read, understand, and extend the generated code.

### 5. AI as a First-Class Citizen

The `ai` construct is a language primitive, not a library:

```shep
# AI-derived field
data Article {
  content: text
  summary: ai("summarize in 2 sentences")
}

# AI condition
action Moderate {
  if ai(text, "is spam") { reject }
}

# AI step
task Categorize {
  ai: classify and route
}
```

The compiler generates:
- LLM API calls
- Prompt construction
- Response parsing
- Caching and retry logic
- Error handling

### 6. Designed for AI Authorship

ShepLang syntax is optimized for LLMs to write:

- **Unambiguous grammar** — No edge cases or ambiguity
- **Structured format** — Easy to parse and validate
- **Domain vocabulary** — Clear semantic meaning
- **Composable** — Small, combinable constructs

An LLM can generate a complete ShepLang program from a natural language description.

---

## What ShepLang Is NOT

- **Not an app builder** — It's a programming language with syntax, AST, and compiler
- **Not a visual tool** — You write code (or AI writes it for you)
- **Not a framework** — The compiler generates framework code (FastAPI, React)
- **Not a platform** — Generated code runs anywhere
- **Not interpretation** — Programs are compiled, not executed by a runtime

---

## Compilation Model

```
Source (.shep)
    │
    ├── Lexer → Tokens
    │
    ├── Parser → AST
    │
    ├── Type Checker → Typed AST
    │
    ├── Verifier → Verified AST
    │
    └── Code Generator
            │
            ├── ShepThon → Python
            ├── ShepLang-JS → TypeScript
            └── ShepSQL → PostgreSQL
```

Each phase has clear inputs, outputs, and error handling.

---

## Target Users

### Primary: AI Agents + LLMs

ShepLang is designed to be **machine-written**:
- Coding assistants can generate ShepLang from descriptions
- Agents can modify ShepLang programs
- CI/CD can verify and compile automatically

### Secondary: Technical Founders + Developers

If you understand programming:
- Write ShepLang directly
- Faster than Python + React + SQL
- Strong verification catches errors early

### Tertiary: Non-Technical Users

With AI assistance:
- Describe what you want in natural language
- AI generates ShepLang
- You review and approve

---

## The Vision

**ShepLang becomes the intermediate representation for AI-generated software.**

```
Human intent (natural language)
    ↓
AI generates ShepLang program
    ↓
Human reviews/edits ShepLang
    ↓
Compiler generates Python + JS + SQL
    ↓
Deploy to production
```

ShepLang is:
- **High-level enough** for AI to reason about
- **Precise enough** for compilation
- **Readable enough** for human review

---

## Golden Sheep AI Methodology

ShepLang embodies these principles:

1. **Vertical Slice Delivery** — Complete features, not layers
2. **Verification-First** — Catch errors at compile time
3. **AI-Native** — AI is a language primitive
4. **Human-Reviewable** — Code you can read and trust

---

*ShepLang: A programming language for the AI era.*
