<p align="center">
  <img src="https://raw.githubusercontent.com/Radix-Obsidian/ShepStack/main/shepstack/branding/logo-256.png" alt="ShepLang Logo" width="128" />
</p>

# ShepLang for VS Code

**The first programming language with AI as a built-in verb.**

Full IDE support for ShepLang in VS Code, Windsurf, Cursor, and other editors via the Language Server Protocol.

## ✨ Features

| Feature | Status |
|---------|--------|
| ✅ Syntax highlighting | Complete |
| ✅ Real-time diagnostics | Complete |
| ✅ Code completion | Complete |
| ✅ Hover information | Complete |
| ✅ Go to definition | Complete |
| ✅ Find all references | Complete |

## 🎯 What is ShepLang?

ShepLang is an **AI-native programming language** that compiles to production-ready code:
- **Backend:** Python (FastAPI + Pydantic)
- **Frontend:** TypeScript (React + types)
- **Database:** PostgreSQL (with schema + migrations)

Write once, get Python + TypeScript + SQL:

```shep
app "SupportTickets"

data Ticket {
  message: text (required)
  sentiment: ai("classify as positive, neutral, negative")
  status: enum(open, resolved, escalated)
}

action EscalateTicket {
  if ai(message, "sounds frustrated") {
    set status = escalated
    notify on-call-agent
  }
}
```

**Key innovation:** `ai()` is a language primitive, not a library call.

## 🚀 Getting Started

### 1. Install the Extension

Search for **"ShepLang"** in the VS Code Extensions marketplace:

- **VS Code:** Built-in Extensions view
- **Windsurf:** Same as VS Code
- **Cursor:** Same as VS Code
- **Other editors:** Use Language Server Protocol support

### 2. Install the CLI

```bash
npm install -g @goldensheepai/shep-cli
```

Requires Node.js 20+ and npm 10+

### 3. Create Your First Program

```bash
# Generate a new project
shep new my-app
cd my-app

# Or let AI write it
shep draft "A todo app with AI-powered priority suggestions"

# Compile to Python + TypeScript + SQL
shep compile --input app.shep --output generated

# Verify without generating code
shep verify app.shep

# Live development with hot reload
shep dev
```

### 4. Deploy

```bash
# Generate deployment configuration
shep deploy --platform railway  # or: render, fly, vercel
```

## 📖 Language Constructs

| Construct | Purpose | Compiles To |
|-----------|---------|-------------|
| `app` | Program declaration | Project metadata |
| `data` | Data models | Pydantic + TypeScript interfaces + SQL tables |
| `view` | UI components | React components |
| `action` | Business logic | FastAPI endpoints |
| `task` | Background jobs | Async task queue |
| `ai()` | AI as a verb | LLM API calls + caching + retry logic |
| `rule` | Business constraints | Validation layer |
| `integration` | External services | API client stubs |

## 🔗 Resources

- **GitHub Repository:** https://github.com/Radix-Obsidian/ShepStack
- **npm Package:** https://www.npmjs.com/package/@goldensheepai/shep-cli
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=Radix-Obsidian.sheplang
- **Documentation:** https://github.com/Radix-Obsidian/ShepStack/tree/main/shepstack/docs
- **Examples:** https://github.com/Radix-Obsidian/ShepStack/tree/main/shepstack/examples

## 🐑 Philosophy

> "Simplicity is the ultimate sophistication." — Steve Jobs

ShepLang philosophy:
- **For AI:** Structured enough for LLMs to generate correctly
- **For Humans:** Readable and reviewable by non-specialists
- **For Founders:** Generate full-stack apps from specifications

## 📊 Version Information

| Component | Version | Status |
|-----------|---------|--------|
| VS Code Extension | 0.1.4 | ✅ Published |
| @goldensheepai/shep-cli | 0.1.4 | ✅ Published on npm |
| @goldensheepai/shep-core | 0.1.4 | ✅ Published on npm |
| @goldensheepai/shep-lsp | 0.1.4 | ✅ Published on npm |
| Language Server | 0.1.4 | ✅ Ready |

## 🤝 Support

- **Issues:** https://github.com/Radix-Obsidian/ShepStack/issues
- **Discussions:** https://github.com/Radix-Obsidian/ShepStack/discussions
- **Twitter:** [@ShepLangOfficial](https://twitter.com)

---

**AI writes the code. You own the vision.** 🐑

*Built with ❤️ by [Golden Sheep AI](https://goldensheepai.com)*
