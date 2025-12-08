# ShepLang Wiki

**ShepLang is the first programming language with AI as a built-in verb.**

## 📚 Documentation

### Getting Started

- [Quick Start Guide](quickstart) — Install and write your first program
- [ShepLang by Example](sheplang-by-example) — Learn through complete examples
- [Syntax Reference](syntax-reference) — Complete syntax documentation

### Language Reference

- [Language Specification](language-spec) — Formal language definition
- [Type System](type-system) — Types, constraints, and validation
- [AI Primitive](ai-primitive) — How `ai()` works

### Compilation

- [ShepThon (Python)](shepthon) — Python code generation
- [ShepLang-JS](sheplang-js) — TypeScript code generation
- [ShepSQL](shepsql) — SQL schema generation

### Tooling

- [CLI Reference](cli) — Command-line interface
- [VS Code Extension](vscode) — IDE support
- [LSP](lsp) — Language Server Protocol

---

## 🎯 Key Concepts

### What Makes ShepLang Different

```shep
# AI is a language primitive, not an import
action ModerateContent {
  if ai(text, "is offensive or inappropriate") {
    reject
  }
}
```

This compiles to Python with:
- ✅ Retry logic with exponential backoff
- ✅ Response caching
- ✅ Cost tracking
- ✅ Rate limiting
- ✅ Structured output validation

### Language Constructs

| Construct | Purpose | Compiles To |
|-----------|---------|-------------|
| `app` | Program declaration | Entry point |
| `data` | Data models | Pydantic + TypeScript + SQL |
| `view` | UI components | React components |
| `action` | Business logic | API endpoints |
| `task` | Background jobs | Async workers |
| `ai()` | AI operations | LLM API calls |

---

## 🚀 Quick Reference

### Installation

```bash
npm install -g @goldensheepai/shep-cli
```

### Commands

```bash
shep new <name>           # Create new project
shep draft "description"  # AI generates ShepLang
shep compile --input app.shep  # Compile to code
shep verify app.shep      # Check for errors
shep dev                  # Watch mode
shep deploy               # Deploy helpers
```

### Minimal Example

```shep
app "Hello"

data Message {
  text: text (required)
  sentiment: ai("classify as positive, neutral, negative")
}

view MessageList {
  show: [text, sentiment]
}

action SendMessage {
  validate text is not empty
  save Message
}
```

---

## 🔗 Links

- [GitHub Repository](https://github.com/Radix-Obsidian/ShepStack)
- [npm Packages](https://www.npmjs.com/org/goldensheepai)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=goldensheepai.sheplang)
- [Discussions](https://github.com/Radix-Obsidian/ShepStack/discussions)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](https://github.com/Radix-Obsidian/ShepStack/blob/main/CONTRIBUTING.md) for guidelines.

---

*"AI writes the code. You own the vision."*
