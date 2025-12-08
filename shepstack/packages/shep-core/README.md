# @goldensheepai/shep-core

**The core engine for ShepLang — parser, verifier, type system, and AST.**

[![npm](https://img.shields.io/npm/v/@goldensheepai/shep-core?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shep-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is shep-core?

`shep-core` is the foundational package for ShepLang. It provides:

- **Lexer & Parser** — Tokenizes and parses `.shep` files into an AST
- **Type System** — Full type inference and checking for ShepLang constructs
- **Verifier** — Validates specs for correctness, wiring, and constraint satisfaction
- **AST Types** — TypeScript interfaces for the entire ShepLang AST

---

## Installation

```bash
npm install @goldensheepai/shep-core
```

---

## Usage

```typescript
import { parse, verifySpec } from '@goldensheepai/shep-core';

// Parse a ShepLang program
const source = `
app "MyApp"

data User {
  email: text (required)
  role: enum(admin, user)
}
`;

const ast = parse(source);

// Verify the spec
const result = verifySpec(ast);

if (result.issues.length === 0) {
  console.log('Spec is valid!');
} else {
  result.issues.forEach(issue => {
    console.log(`${issue.severity}: ${issue.message}`);
  });
}
```

---

## API Reference

### `parse(source: string): ShepSpec`

Parses ShepLang source code and returns the AST.

### `verifySpec(spec: ShepSpec): VerificationResult`

Validates a parsed spec for:
- Type correctness
- Entity/screen/flow wiring
- Constraint satisfaction
- Relationship cycles

### `tokenize(source: string): Token[]`

Returns the token stream for a ShepLang program.

---

## AST Types

The package exports all AST node types:

```typescript
import type {
  ShepSpec,
  EntityNode,
  ScreenNode,
  FlowNode,
  RuleNode,
  FieldNode,
  AINode
} from '@goldensheepai/shep-core';
```

---

## Error Codes

| Code | Description |
|------|-------------|
| E001 | Unknown entity reference |
| E002 | Unknown field reference |
| E003 | Type mismatch |
| S001 | Screen references unknown entity |
| F001 | Flow references unknown screen |
| R001 | Rule constraint conflict |

---

## Related Packages

- [@goldensheepai/shep-cli](https://www.npmjs.com/package/@goldensheepai/shep-cli) — CLI tool
- [@goldensheepai/shep-sheplang](https://www.npmjs.com/package/@goldensheepai/shep-sheplang) — TypeScript codegen
- [@goldensheepai/shep-shepthon](https://www.npmjs.com/package/@goldensheepai/shep-shepthon) — Python codegen
- [@goldensheepai/shep-lsp](https://www.npmjs.com/package/@goldensheepai/shep-lsp) — Language Server

---

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)
