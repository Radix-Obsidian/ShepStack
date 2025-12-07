# Shepstack

A vertical-slice, spec-first language stack for building modern applications.

## What is Shep?

Shep is a language ecosystem designed around the principle of **vertical slices** and **specification-first development**. Rather than building monolithic applications, Shep enables you to define self-contained, end-to-end features that span from data models through API endpoints to UI components.

The stack provides multiple language targets:

- **Sheplang**: A TypeScript-targeting DSL for building full-stack applications
- **Shepthon**: A Python-targeting layer for backend and data services
- **Shep Core**: The shared language core (lexer, parser, AST, type system)

## Architecture

```text
shepstack/
├── packages/
│   ├── shep-core/        # Shared language core (tokens, AST, types)
│   ├── sheplang/         # TypeScript-targeting DSL compiler
│   ├── shepthon/         # Python-targeting compiler
│   └── shep-cli/         # Developer CLI
├── editors/
│   └── vscode-extension/ # VS Code integration via LSP
├── packages/
│   └── shep-lsp/         # Language Server Protocol implementation
├── examples/
│   └── budget-dashboard/ # Reference implementation
└── docs/                 # Specifications and roadmap
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Compile a Shep file
pnpm -C packages/shep-cli exec shep compile --lang sheplang --input example.shep
```

## Development

This is a pnpm workspace mono-repo. Each package is independently versioned and published.

### Scripts

- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Test all packages
- `pnpm dev` - Start development server for the budget-dashboard example

## Roadmap

### Phase 1: Foundation (Current)

- [ ] Core language infrastructure (lexer, parser, AST)
- [ ] Basic Sheplang compiler to TypeScript
- [ ] Basic Shepthon compiler to Python
- [ ] CLI scaffolding
- [ ] Language Server skeleton

### Phase 2: Language Features

- [ ] Type system implementation
- [ ] Component model for Sheplang
- [ ] Route definitions
- [ ] Data model specifications

### Phase 3: Tooling

- [ ] Full LSP implementation
- [ ] VS Code extension features
- [ ] Development server
- [ ] Hot reload

### Phase 4: Ecosystem

- [ ] Package manager integration
- [ ] Standard library
- [ ] Community examples
- [ ] Documentation

## Contributing

This is an experimental language project. Contributions welcome!

## License

MIT
