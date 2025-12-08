# @goldensheepai/shep-cli

**The CLI for ShepLang — compile, verify, and deploy Shep specifications.**

[![npm](https://img.shields.io/npm/v/@goldensheepai/shep-cli?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shep-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install -g @goldensheepai/shep-cli
```

---

## Quick Start

```bash
# Create a new ShepLang project
shep new my-app
cd my-app

# Let AI write your spec
shep draft "A task manager with priorities and due dates"

# Compile to Python + TypeScript + SQL
shep compile --input app.shep --output generated

# Verify without generating
shep verify app.shep
```

---

## Commands

### `shep new <name>`

Creates a new ShepLang project with starter files.

```bash
shep new my-saas-app
```

### `shep draft "<description>"`

Uses AI to generate a ShepLang spec from a natural language description.

```bash
shep draft "An e-commerce store with products, cart, and checkout"
```

### `shep compile`

Compiles a `.shep` file to production-ready code.

```bash
shep compile --input app.shep --output generated
```

**Output:**

- `backend/` — Python (FastAPI + Pydantic)
- `frontend/` — TypeScript (React + types)
- `schema.sql` — PostgreSQL schema
- `auth.py` — JWT authentication
- `admin.html` — Admin dashboard

### `shep verify`

Validates a spec without generating code.

```bash
shep verify app.shep
shep verify app.shep --strict   # Treat warnings as errors
shep verify app.shep --json     # JSON output
```

### `shep style`

Applies styling improvements (Tailwind, shadcn/ui).

```bash
shep style --input generated/frontend
```

### `shep deploy`

Generates deployment configs for Railway, Render, Fly.io, Vercel.

```bash
shep deploy --platform railway
```

---

## Example

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

```bash
shep compile --input support.shep --output generated
```

---

## Related Packages

- [@goldensheepai/shep-core](https://www.npmjs.com/package/@goldensheepai/shep-core) — Parser & verifier
- [@goldensheepai/shep-sheplang](https://www.npmjs.com/package/@goldensheepai/shep-sheplang) — TypeScript codegen
- [@goldensheepai/shep-shepthon](https://www.npmjs.com/package/@goldensheepai/shep-shepthon) — Python codegen
- [@goldensheepai/shep-lsp](https://www.npmjs.com/package/@goldensheepai/shep-lsp) — Language Server

---

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)
