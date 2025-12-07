# Quick Start Guide

Build your first Shep app in 5 minutes.

## Prerequisites

- Node.js 18+
- Python 3.10+
- pnpm (recommended) or npm

## Installation

```bash
# Clone the repo
git clone https://github.com/Radix-Obsidian/ShepStack.git
cd ShepStack/shepstack

# Install dependencies
pnpm install

# Build
pnpm build

# Link CLI globally
cd packages/shep-cli
pnpm link --global
```

## Create Your First App

### Option 1: Use a Template

```bash
# Create a new SaaS project
shep new my-saas --template saas
cd my-saas
```

### Option 2: Let AI Write It

```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key-here

# Generate spec from description
shep draft "I want a task management app with projects, tasks, and team members"
```

### Option 3: Write From Scratch

Create `app.shep`:

```shep
app "TaskManager"
  description: "A simple task management app"
  version: "1.0"

entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - createdAt: datetime (required)

entity Task:
  fields:
    - title: text (required)
    - description: text
    - status: enum(todo, in_progress, done) (required)
    - assignee: relationship(User)
    - createdAt: datetime (required)

screen TaskList (list):
  entity: Task
  fields: [title, status, assignee]

screen TaskForm (form):
  entity: Task
  fields: [title, description, status, assignee]

flow "Create task":
  1. User clicks "New Task"
  2. User fills out task form
  3. System creates task
  4. Task appears in list

rule "Only assignee can complete":
  if user != task.assignee → disable complete button
```

## Generate Code

```bash
# Verify the spec first
shep verify app.shep

# Generate Python + TypeScript + SQL
shep compile --input app.shep --output generated
```

This creates:

```
generated/
├── models.py       # Pydantic models
├── routes.py       # FastAPI endpoints
├── ai_client.py    # AI functions (if using ai())
├── main.py         # FastAPI entry point
├── schema.sql      # PostgreSQL schema
├── types.ts        # TypeScript interfaces
├── api.ts          # API client
├── hooks.ts        # React hooks
└── ai.ts           # Frontend AI client
```

## Run the Backend

```bash
cd generated

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 3001
```

Open http://localhost:3001/docs to see the API documentation.

## Development Mode

Use `shep dev` for hot reload:

```bash
shep dev --input app.shep --output generated
```

This:
1. Compiles your spec
2. Starts the backend server
3. Watches for changes
4. Recompiles and restarts on save

## Add AI Features

Add AI to your spec:

```shep
entity Task:
  fields:
    - title: text (required)
    - description: text
    - priority: ai("classify as low, medium, or high based on description")
    - suggestedAssignee: ai("suggest best team member based on task type")

rule "Auto-prioritize urgent tasks":
  if ai(task.description, "sounds urgent or time-sensitive") → set priority = high
```

Set your API key:

```bash
export ANTHROPIC_API_KEY=your-key-here
# or
export OPENAI_API_KEY=your-key-here
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `shep new <name>` | Create new project |
| `shep draft "..."` | AI generates spec |
| `shep verify <file>` | Validate spec |
| `shep compile --input <file>` | Generate code |
| `shep dev` | Watch mode + hot reload |
| `shep style --analyze <dir>` | Generate AGENTS.md |

## Templates

```bash
shep new my-app                      # Blank starter
shep new my-app --template saas      # Multi-tenant SaaS
shep new my-app --template marketplace  # Two-sided marketplace
shep new my-app --template ai-chat   # AI chat application
```

## Next Steps

1. **Read the [Syntax Reference](./syntax-reference.md)** - Complete language guide
2. **Explore [SupportAI Example](../../examples/support-ai/)** - Full AI chat app
3. **Install VS Code Extension** - Syntax highlighting for `.shep` files

## Getting Help

- **Issues:** https://github.com/Radix-Obsidian/ShepStack/issues
- **Discussions:** https://github.com/Radix-Obsidian/ShepStack/discussions

---

*"Build narrow. Test deep. Ship confidently."*
