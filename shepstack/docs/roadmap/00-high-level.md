# Shep Development Roadmap

## Overview

Shep is a **code generator for founders**. Non-technical founders write structured specs describing their product. Shep generates production-ready Python (FastAPI) + TypeScript (React) + database schemas.

**One spec → Full-stack working application**

### The AI Differentiator

Shep is the **first spec language with AI built in as a primitive**. AI is not an integration — it's a verb in the language. Founders describe intent in plain English, and Shep handles prompts, API calls, caching, and error handling.

- **Phase 1-2**: `ai()` as a verb in rules and flows (hidden magic, immediate value)
- **Phase 3+**: AI writes the first draft of specs (the "wow" moment)

---

## Phase 1: Spec Parser & Basic Codegen (Weeks 1-3)

**Goal**: Parse founder specs and generate working code for a simple use case

### Deliverables

- [x] Mono-repo scaffolding
- [ ] **Spec parser** (indentation-based, YAML-like syntax)
  - [ ] Parse `entity` definitions
  - [ ] Parse `screen` definitions
  - [ ] Parse `flow` definitions
  - [ ] Parse `rule` definitions (including `ai()` conditions)
  - [ ] Parse `integration` declarations
  - [ ] Parse `ai()` primitives in rules and flows
- [ ] **Python codegen** (FastAPI + Pydantic)
  - [ ] Entity → Pydantic models
  - [ ] Screen (kind: api) → FastAPI routes
  - [ ] Rules → validation logic
  - [ ] Integrations → API client setup
  - [ ] `ai()` calls → LLM API integration (Claude/OpenAI)
- [ ] **TypeScript codegen** (React)
  - [ ] Entity → TypeScript interfaces
  - [ ] Screen → React components
  - [ ] Flows → routing configuration
- [ ] **Database codegen** (PostgreSQL)
  - [ ] Entity → table schema
  - [ ] Relationships → foreign keys
- [ ] **CLI command**: `shep compile spec.shep`
- [ ] **Example**: SupportAI (knowledge base + AI chat + escalation)

### Success Criteria

✅ Can write a spec for a simple SaaS (3-5 entities, 5-7 screens)
✅ Run `shep compile` and get working Python + TypeScript
✅ Deploy generated code to Vercel (frontend) + Railway (backend)
✅ Generated code is idiomatic and readable
✅ No manual wiring needed (types match, API calls work)
✅ `ai()` primitives work in rules (e.g., sentiment detection, classification)

**Timeline**: 3 weeks

---

## Phase 2: Verification Engine + AI Primitives (Weeks 4-6)

**Goal**: Catch errors at compile time, not runtime. AI becomes a first-class verb.

### Deliverables

- [ ] **AI as a language primitive**
  - [ ] `ai()` in rule conditions: `if ai(message, "sounds frustrated") → escalate`
  - [ ] `ai()` in flow steps: `ai: categorize and route to correct team`
  - [ ] `ai()` for field derivation: `summary: ai("summarize in 1 sentence")`
  - [ ] Generated prompts with caching and retry logic
  - [ ] Support for Claude and OpenAI backends
- [ ] **Type system**
  - [ ] Basic types (text, number, money, email, date, datetime, boolean, file, image)
  - [ ] Type checking across spec
  - [ ] Type mismatch detection
- [ ] **Constraint validation**
  - [ ] Parse rules as constraints
  - [ ] Validate rules don't conflict
  - [ ] Enforce constraints in generated code
- [ ] **Wiring verification**
  - [ ] Verify all screens reference valid entities
  - [ ] Verify all flows reference valid screens
  - [ ] Verify all integrations are declared
  - [ ] Verify no orphaned fields or screens
- [ ] **Error reporting**
  - [ ] Clear, actionable error messages
  - [ ] Line numbers and context
  - [ ] Suggestions for fixes
- [ ] **Integration verification**
  - [ ] Verify frontend ↔ backend types match
  - [ ] Verify API routes match screen calls
  - [ ] Verify database schema matches entities

### Success Criteria

✅ Compilation fails with clear errors if spec is invalid
✅ Compilation succeeds only if spec is complete and consistent
✅ Generated code has zero type mismatches
✅ All wiring is verified before code generation
✅ `ai()` primitives generate correct LLM calls with error handling
✅ AI behavior is visible in the spec (not buried in code)

**Timeline**: 3 weeks

---

## Phase 3: Developer Experience + AI-Assisted Spec Writing (Weeks 7-9)

**Goal**: Make it fast and pleasant to write specs. AI helps write the first draft.

### Deliverables

- [ ] **AI-assisted spec writing**
  - [ ] `shep draft "I want a SaaS for dog groomers"` → generates first-draft `.shep` file
  - [ ] AI reads founder's plain English description
  - [ ] AI generates entities, screens, flows, rules
  - [ ] Founder edits the human-readable spec, not code
  - [ ] Feedback loop: Founder ↔ AI ↔ Spec ↔ Generated Code
- [ ] **CLI improvements**
  - [ ] `shep new` → scaffold new project
  - [ ] `shep draft` → AI generates first-draft spec from description
  - [ ] `shep dev` → watch mode with hot reload
  - [ ] `shep verify` → check spec without generating
  - [ ] `shep deploy` → one-command deployment
- [ ] **VS Code extension**
  - [ ] Syntax highlighting for `.shep` files
  - [ ] Diagnostics (real-time error reporting)
  - [ ] Code completion (entity names, field names, keywords)
  - [ ] Hover information (field types, descriptions)
- [ ] **Documentation**
  - [ ] Spec syntax guide (with examples)
  - [ ] Tutorial: Build SupportAI from scratch
  - [ ] Migration guide: Existing Python/TS → Shep
  - [ ] FAQ and troubleshooting
- [ ] **Example projects**
  - [ ] SupportAI (AI chat + escalation)
  - [ ] Marketplace (two-sided, payments)
  - [ ] SaaS (multi-tenant, analytics)

### Success Criteria

✅ Founder can write a spec in < 1 hour (or < 10 minutes with AI draft)
✅ IDE provides real-time feedback
✅ Generated code is deployable in < 5 minutes
✅ Comprehensive docs and examples
✅ AI generates usable first-draft specs from plain English

**Timeline**: 3 weeks

---

## Phase 4: Production Hardening (Weeks 10-12)

**Goal**: Make generated code production-ready

### Deliverables

- [ ] **Advanced features**
  - [ ] Authentication/authorization rules
  - [ ] Pagination and filtering
  - [ ] Error handling and retry logic
  - [ ] Rate limiting
  - [ ] Caching strategies
- [ ] **Integrations**
  - [ ] Stripe (payments)
  - [ ] SendGrid (email)
  - [ ] AWS S3 (file storage)
  - [ ] Claude/OpenAI (AI) — already integrated via `ai()` primitive
  - [ ] Analytics (Segment, Mixpanel)
- [ ] **Testing**
  - [ ] Generated unit tests
  - [ ] Generated E2E tests
  - [ ] Integration test templates
- [ ] **Deployment**
  - [ ] Vercel (frontend)
  - [ ] Railway (backend)
  - [ ] Database migrations
  - [ ] Environment configuration
- [ ] **Monitoring**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring
  - [ ] Logs and debugging

### Success Criteria

✅ Generated code handles real production scenarios
✅ Integrations work out of the box
✅ Tests are generated and passing
✅ Deployment is one command
✅ Monitoring and debugging work

**Timeline**: 3 weeks

---

## Phase 5: Ecosystem & Scale (Ongoing)

**Goal**: Build a community and ecosystem around Shep

### Deliverables

- [ ] **Community**
  - [ ] Discord/community forum
  - [ ] Example projects and templates
  - [ ] User feedback loop
- [ ] **Advanced features**
  - [ ] Custom code blocks (for complex logic)
  - [ ] Middleware and hooks
  - [ ] Custom integrations
  - [ ] Plugin system
- [ ] **Additional targets**
  - [ ] Python (Django, SQLAlchemy)
  - [ ] Go (Gin, GORM)
  - [ ] Mobile (React Native, Flutter)
- [ ] **Performance & scale**
  - [ ] Caching layer
  - [ ] Background jobs
  - [ ] Real-time updates (WebSockets)
  - [ ] Microservices support

### Success Criteria

✅ Active community building real products
✅ Founders shipping with Shep
✅ Real revenue/adoption
✅ Ecosystem of templates and integrations

**Timeline**: Ongoing

---

## Key Differences from Old Roadmap

| Old Approach | New Approach |
|---|---|
| "Sheplang and Shepthon" (two languages) | **One spec format** |
| "Component model" | **Screens and flows** |
| "Type inference" | **Constraint validation** |
| "LSP implementation" | **Verification engine** |
| Focus on language features | **Focus on code generation quality** |
| Ecosystem of packages | **Ecosystem of templates and integrations** |

---

## Critical Path to MVP

**Week 1-3**: Spec parser + basic Python/TS codegen + `ai()` syntax
**Week 4-6**: Verification engine + AI primitives (the real value)
**Week 7-9**: DX (CLI, IDE, docs) + AI-assisted spec writing
**Week 10-12**: Production hardening

**By week 12**: Founders can build real SaaS with Shep — with AI built into the language

---

## Success Metrics

- Founder can write a spec in < 1 hour (< 10 min with AI draft)
- Generated code compiles and runs without modification
- Generated code is deployable in < 5 minutes
- Zero type mismatches between frontend and backend
- All wiring verified before deployment
- Founder never touches Python/TypeScript/SQL
- AI intent is declarative and visible in the spec
- AI-generated first-draft specs are usable with minimal edits

---

## How to Contribute

We welcome contributions at any phase! See the main README for development instructions.

### Areas Needing Help

- Lexer/parser implementation
- Code generation for TypeScript and Python
- LSP implementation
- Documentation and examples
- Testing and quality assurance
- Community building and outreach

---

## Questions?

Open an issue on GitHub or join our community discussions.
