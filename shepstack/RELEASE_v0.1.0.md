# ShepLang v0.1.0 — Initial Release 🐑

**The first programming language with AI as a built-in verb.**

---

## 🎉 What is ShepLang?

ShepLang is an AI-native programming language for describing software products. It compiles to Python, TypeScript, and SQL.

```shep
app "SupportTickets"

data Ticket {
  title: text (required)
  message: text
  sentiment: ai("classify as positive, neutral, negative")
}

action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
    alert on-call
  }
}
```

---

## ✨ Highlights

### AI as a Language Primitive

The `ai()` construct is native to ShepLang — not an import, not a library, a **language primitive**.

```shep
# In data (derived fields)
sentiment: ai("classify as positive, neutral, negative")

# In actions (conditional logic)
if ai(text, "is spam") { reject }

# In tasks (automated processing)
task DailyDigest {
  ai: summarize today's activity
}
```

### Complete Compilation

A ShepLang program compiles to production-ready code:

| Target | Output | Status |
|--------|--------|--------|
| ShepThon | Python (FastAPI + Pydantic) | ✅ |
| ShepLang-JS | TypeScript (React + types) | ✅ |
| ShepSQL | PostgreSQL schema | ✅ |

### Full Tooling

| Tool | Description | Status |
|------|-------------|--------|
| `shep compile` | Compile to Python/TS/SQL | ✅ |
| `shep draft` | AI generates ShepLang | ✅ |
| `shep verify` | Type check and validate | ✅ |
| `shep new` | Scaffold new project | ✅ |
| `shep dev` | Watch mode | ✅ |
| `shep deploy` | Deployment helpers | ✅ |
| VS Code Extension | Syntax + LSP | ✅ |

---

## 📦 Packages

Install the CLI:

```bash
npm install -g @goldensheepai/shep-cli
```

All packages:

| Package | Description |
|---------|-------------|
| `@goldensheepai/shep-cli` | Command-line interface |
| `@goldensheepai/shep-core` | Parser, verifier, types |
| `@goldensheepai/shep-lsp` | Language Server Protocol |
| `@goldensheepai/shep-sheplang` | TypeScript codegen |
| `@goldensheepai/shep-shepthon` | Python codegen |

---

## 🚀 Quick Start

```bash
# Install
npm install -g @goldensheepai/shep-cli

# Create new project
shep new my-app
cd my-app

# Or let AI write it
shep draft "A task manager with priorities and deadlines"

# Compile
shep compile --input app.shep --output generated

# Run the backend
cd generated
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🔧 What's Included

### Language Features

- ✅ `app` — Program declaration
- ✅ `data` — Data model definitions
- ✅ `view` — UI component definitions
- ✅ `action` — Business logic
- ✅ `task` — Background processes
- ✅ `rule` — Business constraints
- ✅ `ai()` — AI as a verb

### Field Types

- ✅ Primitives: `text`, `number`, `money`, `email`, `date`, `datetime`, `boolean`
- ✅ Extended: `uuid`, `url`, `phone`, `json`, `array`
- ✅ `enum(value1, value2, ...)`
- ✅ Relationships: `EntityName`, `list(EntityName)`
- ✅ AI-derived: `ai("prompt")`

### Modifiers

- ✅ `(required)` — Field must have value
- ✅ `(unique)` — Value must be unique
- ✅ `(computed)` — Derived field
- ✅ `min=N`, `max=N`, `default=value`, `pattern="regex"`

### Generated Code

- ✅ Pydantic models
- ✅ FastAPI routes (CRUD)
- ✅ TypeScript interfaces
- ✅ React hooks for AI fields
- ✅ PostgreSQL schema
- ✅ JWT authentication
- ✅ Admin dashboard
- ✅ AI client with retry/cache/cost tracking

### IDE Support

- ✅ VS Code syntax highlighting
- ✅ Real-time diagnostics
- ✅ Code completion
- ✅ Hover information
- ✅ Go to definition
- ✅ Find references

---

## 🔮 What's Next (v0.2.0)

- [ ] `task` construct full implementation
- [ ] Plugin system for custom integrations
- [ ] Database migrations
- [ ] Test generation
- [ ] Multi-file projects

---

## 📖 Documentation

- [Quick Start Guide](docs/guides/quickstart.md)
- [ShepLang by Example](docs/guides/sheplang-by-example.md)
- [Language Specification](docs/spec/sheplang-spec.md)
- [Philosophy](docs/spec/shep-philosophy.md)

---

## 🙏 Acknowledgments

Built with inspiration from:

- **Steve Jobs** — Simplicity is the ultimate sophistication
- **Elon Musk** — First principles thinking
- **Guido van Rossum** — Readability counts
- **Anders Hejlsberg** — Tooling IS the product

---

## 📄 License

MIT © Golden Sheep AI

---

**AI writes the code. You own the vision.** 🐑
