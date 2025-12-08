# @goldensheepai/shep-lsp

**Language Server Protocol implementation for ShepLang — IDE support for VS Code, Windsurf, and Cursor.**

[![npm](https://img.shields.io/npm/v/@goldensheepai/shep-lsp?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shep-lsp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is shep-lsp?

`shep-lsp` provides IDE features for ShepLang via the Language Server Protocol:

- **Syntax Highlighting** — Full TextMate grammar
- **Diagnostics** — Real-time error and warning messages
- **Code Completion** — Context-aware suggestions
- **Hover Information** — Type and documentation on hover
- **Go to Definition** — Jump to entity/field definitions
- **Find References** — Locate all usages

---

## Installation

```bash
npm install @goldensheepai/shep-lsp
```

---

## Usage

### Standalone Server

```typescript
import { startServer } from '@goldensheepai/shep-lsp';

// Start the LSP server on stdio
startServer();
```

### With VS Code Extension

The LSP is bundled with the [ShepLang VS Code extension](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang). Install it directly from the marketplace.

---

## Features

### Diagnostics

Real-time validation as you type:

```
Error: Unknown entity 'Usr' referenced in screen 'UserList'
  Did you mean 'User'?
  
Warning: Field 'email' has no validation constraints
  Consider adding (required) or other constraints
```

### Code Completion

Context-aware suggestions:

```shep
data User {
  email: |  # suggests: text, number, boolean, date, money, enum(), ai()
}

view UserList {
  show: [|  # suggests: email, name, role (fields from User)
}
```

### Hover Information

```shep
data User {
  email: text (required)
  ▲
  │
  └── Type: text
      Constraints: required
      Used in: UserList, UserDetail, CreateUserFlow
```

### Go to Definition

`Ctrl+Click` on any reference to jump to its definition.

### Find References

`Shift+F12` to find all usages of an entity, field, or screen.

---

## Configuration

The server supports these initialization options:

```json
{
  "sheplang.validation.strict": false,
  "sheplang.completion.snippets": true,
  "sheplang.diagnostics.delay": 300
}
```

---

## Protocol Support

| Feature | Status |
|---------|--------|
| textDocument/didOpen | ✅ |
| textDocument/didChange | ✅ |
| textDocument/completion | ✅ |
| textDocument/hover | ✅ |
| textDocument/definition | ✅ |
| textDocument/references | ✅ |
| textDocument/publishDiagnostics | ✅ |
| textDocument/formatting | 🚧 |
| textDocument/rename | 🚧 |

---

## Related Packages

- [@goldensheepai/shep-core](https://www.npmjs.com/package/@goldensheepai/shep-core) — Parser & verifier
- [@goldensheepai/shep-cli](https://www.npmjs.com/package/@goldensheepai/shep-cli) — CLI tool
- [@goldensheepai/shep-sheplang](https://www.npmjs.com/package/@goldensheepai/shep-sheplang) — TypeScript codegen
- [@goldensheepai/shep-shepthon](https://www.npmjs.com/package/@goldensheepai/shep-shepthon) — Python codegen

---

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)
