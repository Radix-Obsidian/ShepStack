# ShepLang Development Roadmap

## Overview

**ShepLang is an AI-native programming language for describing software products.**

It has first-class concepts like `app`, `data`, `view`, `action`, and `task`, plus `ai` as a built-in verb. A ShepLang program compiles to Python + JavaScript services (via ShepThon) with auth, admin, and APIs generated automatically.

**Both humans and LLMs can read and write ShepLang.**

### The AI Primitive

ShepLang is the **first programming language with AI as a built-in verb**. AI is not an integration — it's a language construct with defined semantics.

```shep
action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
  }
}
```

---

## Phase 1: Language Core ✅ DONE

**Goal**: Build the lexer, parser, AST, and basic code generation

### Completed ✅

- [x] Mono-repo scaffolding (pnpm workspaces)
- [x] **Lexer** — Tokenization of `.shep` source files
- [x] **Parser** — Parse to AST
  - [x] Parse `app` declarations
  - [x] Parse `data` definitions (entities)
  - [x] Parse `view` definitions (screens)
  - [x] Parse `action` definitions (flows/rules)
  - [x] Parse field types and modifiers
  - [x] Parse relationships
- [x] **AST** — Well-defined node types
- [x] **Python code generation (ShepThon)**
  - [x] Data → Pydantic models
  - [x] View → FastAPI routes
  - [x] Actions → validation logic
  - [x] Main entry point
- [x] **TypeScript code generation**
  - [x] Data → TypeScript interfaces
  - [x] View → React component stubs
  - [x] API client generation
- [x] **SQL code generation**
  - [x] Data → PostgreSQL schema
  - [x] Relationships → foreign keys
- [x] **CLI compiler**: `shep compile`
- [x] **Example program**: SupportAI

---

## Phase 2: Type System & Verification ✅ DONE

**Goal**: Static verification — if it compiles, it works

### Completed ✅

- [x] **Type system**
  - [x] `ShepType` interface for internal type representation
  - [x] `TypeEnvironment` class for type checking
  - [x] Basic types (text, number, money, email, date, datetime, boolean, file, image)
  - [x] Enum types
  - [x] Relationship types
  - [x] Type inference and checking
  - [x] Type mismatch detection
- [x] **Constraint validation**
  - [x] Parse rules as constraints
  - [x] Conflict detection
  - [x] Satisfiability checking
- [x] **Wiring verification**
  - [x] Verify all views reference valid data
  - [x] Verify all actions reference valid data/views
  - [x] Verify no orphaned definitions
  - [x] Relationship cycle detection
- [x] **Error reporting**
  - [x] Error codes (E001-E010, S001-S009, etc.)
  - [x] Line numbers and column positions
  - [x] Fix suggestions for every issue
  - [x] Severity levels (error, warning, info)
- [x] **CLI**: `shep check` (verify without generating)

---

## Phase 3: Runtime Generation ✅ MOSTLY DONE

**Goal**: Generate production-ready runtime code

### Completed ✅

- [x] **Authentication generation**
  - [x] JWT-based auth (login/signup/logout)
  - [x] Password hashing (bcrypt)
  - [x] Token storage helpers
- [x] **Admin dashboard generation**
  - [x] CRUD UI for all data types
  - [x] Form generation based on field types
  - [x] Modal dialogs
- [x] **Deployment support**
  - [x] `shep deploy` command
  - [x] Railway, Render, Fly.io configs
  - [x] Vercel frontend support
- [x] **Styling generation**
  - [x] Tailwind CSS configuration
  - [x] shadcn-style components
- [x] **Advanced field types**
  - [x] UUID, URL, phone, JSON, array
  - [x] Field constraints (min, max, pattern, unique, default)
  - [x] Computed fields
- [x] **Better error messages**
  - [x] Suggestions in parser errors
  - [x] Common mistake detection

### Partial 🚧

- [ ] **AI primitive full implementation**
  - [x] `ai()` syntax parsing
  - [x] Basic AI field code generation
  - [ ] Full LLM API integration
  - [ ] Caching and retry logic
  - [ ] Cost tracking

---

## Phase 4: Developer Experience 🚧 IN PROGRESS

**Goal**: Make it easy to write, test, and debug ShepLang programs

### Completed ✅

- [x] **CLI commands**
  - [x] `shep compile` — compile to Python/TS/SQL
  - [x] `shep check` — verify without generating
  - [x] `shep new` — scaffold new project
  - [x] `shep dev` — watch mode with hot reload
  - [x] `shep deploy` — deployment helpers

### Partial 🚧

- [ ] **VS Code extension**
  - [x] Extension scaffolding
  - [x] Language registration
  - [ ] Syntax highlighting
  - [ ] Diagnostics integration
  - [ ] Code completion
  - [ ] Hover information

### Not Started 📋

- [ ] **AI-assisted program generation**
  - [ ] `shep draft "description"` → generates .shep file
  - [ ] Natural language → ShepLang conversion
- [ ] **Language server (LSP)**
  - [ ] Full LSP protocol implementation
  - [ ] Real-time diagnostics
  - [ ] Go to definition
  - [ ] Find references

---

## Phase 5: Ecosystem 📋 PLANNED

**Goal**: Integrations, plugins, community

### Not Started 📋

- [ ] **Integrations**
  - [ ] Stripe (payments)
  - [ ] SendGrid (email)
  - [ ] AWS S3 (file storage)
  - [ ] Analytics (Segment, Mixpanel)
- [ ] **Testing**
  - [ ] Generated unit tests
  - [ ] Generated E2E tests
- [ ] **Additional compiler targets**
  - [ ] Go backend
  - [ ] Mobile (React Native)
- [ ] **Plugin system**
  - [ ] Custom code blocks
  - [ ] Middleware hooks
- [ ] **Community**
  - [ ] Template marketplace
  - [ ] Plugin registry

---

## Language Constructs Status

| Construct | Parsing | Type Checking | Code Generation |
|-----------|---------|---------------|-----------------|
| `app` | ✅ | ✅ | ✅ |
| `data` | ✅ | ✅ | ✅ |
| `view` | ✅ | ✅ | ✅ |
| `action` | ✅ | ✅ | ✅ |
| `task` | 🚧 | 🚧 | 📋 |
| `ai` | ✅ | 🚧 | 🚧 |

---

## Compiler Targets Status

| Target | Status | Output |
|--------|--------|--------|
| ShepThon (Python) | ✅ Done | FastAPI + Pydantic |
| ShepLang-JS (TypeScript) | ✅ Done | React + Types |
| ShepSQL (PostgreSQL) | ✅ Done | Schema + FK |
| Auth | ✅ Done | JWT auth system |
| Admin | ✅ Done | CRUD dashboard |

---

## What's Next

### Immediate (This Week)

1. Polish VS Code extension (syntax highlighting)
2. Complete `ai` primitive implementation
3. Add `task` construct for background jobs

### Short Term (This Month)

1. `shep draft` — AI generates ShepLang from descriptions
2. Full LSP implementation
3. First integration (Stripe)

### Medium Term (Next Quarter)

1. Additional compiler targets
2. Plugin system
3. Community templates

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup.

### Areas Needing Help

- VS Code extension (syntax highlighting, diagnostics)
- LSP implementation
- Integration code generation (Stripe, SendGrid)
- Documentation and tutorials
- Example programs

---

## Questions?

Open an issue on GitHub or join discussions.
