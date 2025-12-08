# ShepLang Quick Start

Learn ShepLang in 10 minutes.

## Prerequisites

- Node.js 18+
- Python 3.10+
- pnpm (recommended) or npm

## Install the Compiler

```bash
# Clone the repo
git clone https://github.com/Radix-Obsidian/ShepStack.git
cd ShepStack/shepstack

# Install dependencies
pnpm install

# Build the compiler
pnpm build

# Link CLI globally
cd packages/shep-cli
pnpm link --global
```

## Your First Program

Create a file called `hello.shep`:

```shep
app "HelloWorld"

data Greeting {
  message: text (required)
  mood: enum(happy, neutral, sad)
}

view GreetingList {
  show: [message, mood]
}

action CreateGreeting {
  validate message is not empty
  save Greeting
}
```

## Compile It

```bash
# Check for errors
shep check hello.shep

# Compile to Python + TypeScript + SQL
shep compile --input hello.shep --output ./dist
```

This generates:

```
dist/
├── main.py           # FastAPI entry point
├── models.py         # Pydantic models
├── routes.py         # API endpoints
├── auth.py           # JWT authentication
├── admin.html        # Admin dashboard
├── schema.sql        # PostgreSQL schema
├── types.ts          # TypeScript interfaces
├── api.ts            # API client
└── requirements.txt  # Python dependencies
```

## Run It

```bash
cd dist
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

Open:
- API docs: <http://localhost:3001/docs>
- Admin panel: <http://localhost:3001/admin>

---

## Language Concepts

### `data` — Define Data Models

```shep
data User {
  email: email (required, unique)
  name: text (required)
  role: enum(admin, user)
  createdAt: datetime
}

data Task {
  title: text (required)
  status: enum(todo, done)
  assignee: User  # Relationship
}
```

### `view` — Define UI Components

```shep
view TaskList {
  show: [title, status, assignee]
  filter: status
  sort: createdAt desc
}

view TaskForm {
  input: [title, status, assignee]
  submit: CreateTask
}
```

### `action` — Define Business Logic

```shep
action CreateTask {
  validate title is not empty
  save Task
  notify assignee
}

action CompleteTask {
  set status = done
  log "Task completed"
}
```

### `ai` — AI as a Language Primitive

```shep
data Ticket {
  message: text (required)
  sentiment: ai("classify as positive, neutral, negative")
  summary: ai("summarize in one sentence")
}

action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set priority = high
    alert on-call
  }
}
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `shep check <file>` | Verify syntax and types |
| `shep compile --input <file>` | Compile to Python/TS/SQL |
| `shep new <name>` | Create new project |
| `shep dev` | Watch mode + hot reload |
| `shep deploy` | Deployment helpers |

---

## What's Next

1. **[Syntax Reference](./syntax-reference.md)** — Complete language grammar
2. **[Language Spec](../spec/sheplang-spec.md)** — Formal specification
3. **[Example: SupportAI](../../examples/support-ai/)** — Full program with AI

---

## Getting Help

- **Issues:** <https://github.com/Radix-Obsidian/ShepStack/issues>
- **Discussions:** <https://github.com/Radix-Obsidian/ShepStack/discussions>

---

*ShepLang: A programming language for the AI era.*
