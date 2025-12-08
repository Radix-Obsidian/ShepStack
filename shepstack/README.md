# 🐑 ShepLang

**An AI-native programming language for describing software products.**

ShepLang has first-class concepts like `app`, `data`, `view`, `action`, and `task`, plus `ai` as a built-in verb. A ShepLang program compiles to Python + JavaScript services (via ShepThon) with auth, admin, and APIs generated automatically. Both humans and LLMs can read and write ShepLang.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/Radix-Obsidian/ShepStack?style=flat-square)](https://github.com/Radix-Obsidian/ShepStack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org/)

## What is ShepLang?

ShepLang is a **programming language**, not an app builder. It has:

- **Syntax** — A clean, indentation-based grammar
- **AST** — A well-defined abstract syntax tree
- **Type System** — Static types with verification
- **Compiler** — Transforms ShepLang → Python + JS + SQL
- **Semantics** — Clear rules for what programs mean

### Language Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| `app` | Program declaration | `app "MyProduct"` |
| `data` | Data model definitions | `data User { email: text }` |
| `view` | UI component definitions | `view UserList { show: [email, name] }` |
| `action` | Business logic | `action CreateUser { validate email }` |
| `task` | Background processes | `task SendWelcomeEmail { on: user.created }` |
| `ai` | AI as a verb | `ai: classify sentiment` |

## Quick Example

```shep
app "SupportTickets"

data Ticket {
  title: text (required)
  message: text (required)
  status: enum(open, resolved, escalated)
  sentiment: ai("classify as positive, neutral, negative")
}

data User {
  email: email (required, unique)
  role: enum(customer, agent, admin)
}

view TicketList {
  show: [title, status, sentiment]
  filter: status
  sort: createdAt desc
}

view TicketDetail {
  show: [title, message, status]
  actions: [resolve, escalate]
}

action ResolveTicket {
  set status = resolved
  notify user
}

action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
    alert on-call agent
  }
}

task AutoCategorize {
  on: ticket.created
  ai: categorize and route to correct team
}
```

## The AI Primitive

**ShepLang is the first programming language with AI as a built-in verb.**

```shep
# AI in data fields (derived values)
data Article {
  content: text
  summary: ai("summarize in 2 sentences")
  category: ai("classify: tech, business, lifestyle")
}

# AI in actions (conditional logic)
action ModerateComment {
  if ai(comment.text, "is offensive or spam") {
    reject with "Content policy violation"
  }
}

# AI in tasks (automated processing)
task ProcessSupport {
  ai: draft initial response
  ai: suggest relevant docs
  assign to agent
}
```

When you use `ai`, the compiler generates:
- LLM API calls (Claude/OpenAI)
- Prompt construction with context
- Response parsing and validation
- Caching, retry logic, error handling
- Cost tracking and rate limiting

**You write intent. The compiler handles complexity.**

## Compilation

ShepLang compiles to production services:

```
┌─────────────────┐
│   ShepLang      │ ← You write this
│   (.shep file)  │
└────────┬────────┘
         │ compile
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ShepThon      │     │   ShepLang-JS   │     │   ShepSQL       │
│   (Python)      │     │   (TypeScript)  │     │   (PostgreSQL)  │
│   FastAPI +     │     │   React +       │     │   Schema +      │
│   Pydantic      │     │   Types         │     │   Migrations    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Language Architecture

```
shepstack/
├── packages/
│   ├── shep-core/        # Language core: lexer, parser, AST, type system
│   ├── shep-cli/         # Compiler CLI: shep compile, shep check
│   ├── shep-lsp/         # Language Server Protocol for IDEs
│   ├── shepthon/         # Python backend compiler target
│   └── sheplang/         # TypeScript frontend compiler target
├── editors/
│   └── vscode-extension/ # VS Code language support
├── examples/
│   └── support-ai/       # Example ShepLang program
└── docs/
    ├── spec/             # Language specification
    ├── guides/           # Language tutorials
    └── roadmap/          # Development roadmap
```

## Getting Started

### Install

```bash
# Clone the repo
git clone https://github.com/Radix-Obsidian/ShepStack.git
cd ShepStack/shepstack

# Install dependencies
pnpm install

# Build the compiler
pnpm build

# Link CLI
cd packages/shep-cli && pnpm link --global
```

### Write Your First Program

Create `hello.shep`:

```shep
app "Hello"

data Greeting {
  message: text (required)
  mood: ai("classify as happy, neutral, sad")
}

view GreetingForm {
  input: [message]
  submit: CreateGreeting
}

action CreateGreeting {
  save Greeting
  show "Created!"
}
```

### Compile

```bash
# Check syntax and types
shep check hello.shep

# Compile to Python + TypeScript + SQL
shep compile --input hello.shep --output ./dist
```

### Run

```bash
cd dist
pip install -r requirements.txt
uvicorn main:app --reload
```

## Documentation

- **[Language Specification](./docs/spec/sheplang-spec.md)** — Formal syntax and semantics
- **[ShepThon Spec](./docs/spec/shepthon-spec.md)** — Python backend profile
- **[Philosophy](./docs/spec/shep-philosophy.md)** — Design principles
- **[Syntax Reference](./docs/guides/syntax-reference.md)** — Complete grammar reference
- **[Quick Start](./docs/guides/quickstart.md)** — Tutorial
- **[Roadmap](./docs/roadmap/00-high-level.md)** — Development status

## Development Status

### Implemented ✅

- [x] Lexer and parser
- [x] AST and type system
- [x] Type verification engine
- [x] Python code generation (ShepThon)
- [x] TypeScript code generation
- [x] SQL schema generation
- [x] CLI compiler (`shep compile`, `shep check`)
- [x] Auth generation (JWT)
- [x] Admin dashboard generation
- [x] Error messages with suggestions

### In Progress 🚧

- [ ] `ai` primitive full implementation
- [ ] `task` background jobs
- [ ] VS Code extension polish
- [ ] Language server diagnostics

### Planned 📋

- [ ] AI-assisted program generation (`shep draft`)
- [ ] Database migrations
- [ ] Plugin system
- [ ] Additional compiler targets (Go, Rust)

## Who Is This For?

### Primary: AI Agents + LLMs

ShepLang is designed to be **written by AI**. The syntax is:
- Unambiguous (no edge cases)
- Structured (easy to parse)
- Domain-specific (clear semantics)
- Readable (humans can review)

### Secondary: Technical Founders + Developers

If you understand programming concepts, you can write ShepLang directly. It's faster than writing Python + React + SQL separately.

### Tertiary: Non-Technical Founders

With AI assistance, non-technical users can describe what they want in natural language, and AI generates the ShepLang program for them to review.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT — See [LICENSE](./LICENSE)

---

**ShepLang: A programming language for the AI era.**

*Built by [Golden Sheep AI](https://goldensheepai.com)*
