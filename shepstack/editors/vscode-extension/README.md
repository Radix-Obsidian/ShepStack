<p align="center">
  <img src="https://raw.githubusercontent.com/Radix-Obsidian/ShepStack/main/shepstack/branding/logo-256.png" alt="ShepLang Logo" width="128" />
</p>

# ShepLang for VS Code

**The first programming language with AI as a built-in verb.**

Full language support for ShepLang in VS Code, Windsurf, and Cursor.

## Features

| Feature | Status |
|---------|--------|
| ✅ Syntax highlighting | Complete |
| ✅ Diagnostics | Complete |
| ✅ Code completion | Complete |
| ✅ Hover information | Complete |
| ✅ Go to definition | Complete |
| ✅ Find references | Complete |

## What is ShepLang?

ShepLang is an AI-native programming language that compiles to Python, TypeScript, and SQL.

```shep
data Ticket {
  message: text (required)
  sentiment: ai("classify as positive, neutral, negative")
}

action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
  }
}
```

**AI is a language primitive** — not an import, not a library.

## Installation

### VS Code / Windsurf / Cursor

Search for "ShepLang" in the Extensions marketplace.

### CLI

```bash
npm install -g @goldensheepai/shep-cli
```

## Quick Start

```bash
# Create new project
shep new my-app

# Or let AI write your program
shep draft "A task manager with priorities"

# Compile
shep compile --input app.shep --output generated
```

## Language Constructs

| Construct | Purpose |
|-----------|---------|
| `app` | Program declaration |
| `data` | Data models |
| `view` | UI components |
| `action` | Business logic |
| `task` | Background jobs |
| `ai()` | AI primitive |

## Links

- [GitHub](https://github.com/Radix-Obsidian/ShepStack)
- [Documentation](https://github.com/Radix-Obsidian/ShepStack/tree/main/shepstack/docs)
- [npm](https://www.npmjs.com/package/@goldensheepai/shep-cli)

---

**AI writes the code. You own the vision.** 🐑
