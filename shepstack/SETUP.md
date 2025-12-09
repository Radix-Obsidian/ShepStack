# ShepLang Development Setup

## Quick Start

### For Users (Install CLI)

The easiest way to use ShepLang is to install the CLI from npm:

```bash
# Install globally
npm install -g @goldensheepai/shep-cli

# Verify installation
shep --version
shep compile --help
```

### For Contributors (Development Setup)

If you want to contribute or modify the compiler:

```bash
# Clone the repo
git clone https://github.com/Radix-Obsidian/ShepStack.git
cd ShepStack/shepstack

# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm build

# Test the CLI
pnpm -C packages/shep-cli exec shep --help
```

## Repository Structure

This is the ShepLang compiler and toolchain mono-repo (pnpm monorepo):

```
shepstack/
├── packages/
│   ├── shep-core/          # Core language: parser, verifier, AST, types
│   ├── sheplang/           # TypeScript-targeting code generator
│   ├── shepthon/           # Python-targeting code generator
│   ├── shep-cli/           # CLI tool (@goldensheepai/shep-cli on npm)
│   └── shep-lsp/           # Language Server Protocol support
├── editors/
│   └── vscode-extension/   # VS Code extension
├── examples/
│   └── budget-dashboard/   # Reference implementation
├── docs/
│   ├── spec/               # Language specifications
│   └── roadmap/            # Development roadmap
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # Workspace definition
├── tsconfig.base.json      # Shared TypeScript config
└── README.md               # Project overview
```

## Prerequisites

- **Node.js:** 20 or higher
- **pnpm:** 8 or higher (for development)
- **npm:** 10 or higher (for installing the published CLI)

## NPM Packages

The following packages are published to npm under the `@goldensheepai` scope:

- **`@goldensheepai/shep-core`** — Core language library
  - Parser, verifier, AST, type system
  - Used by: shep-cli, shep-lsp, code generators

- **`@goldensheepai/shep-cli`** — Command-line interface (main entry point)
  - `shep compile` - Compile Shep specifications
  - `shep verify` - Type check without generating code
  - `shep dev` - Development server with hot reload
  - Install with: `npm install -g @goldensheepai/shep-cli`

- **`@goldensheepai/shep-sheplang`** — TypeScript code generator
  - Transforms Shep specs to TypeScript/React
  - Used by shep-cli for frontend compilation

- **`@goldensheepai/shep-shepthon`** — Python code generator
  - Transforms Shep specs to Python/FastAPI
  - Used by shep-cli for backend compilation

- **`@goldensheepai/shep-lsp`** — Language Server Protocol
  - IDE integration (VS Code, Cursor, Windsurf)
  - Provides diagnostics, completion, hover info

### Editor Integration

- **`vscode-extension`** — VS Code extension
  - Syntax highlighting
  - Language Server support
  - Diagnostics and code completion

### Examples & Documentation

- **`budget-dashboard`**: Full-stack example
  - Sheplang frontend components
  - Shepthon backend API
  - Reference for language features

- **`docs/spec/`**: Language specifications
  - Shep philosophy
  - Sheplang specification
  - Shepthon specification

- **`docs/roadmap/`**: Development roadmap
  - Phase-by-phase breakdown
  - Timeline and milestones
  - Contribution opportunities

## Development Workflow

### Building a Single Package

```bash
# Build shep-core
pnpm -C packages/shep-core build

# Build sheplang
pnpm -C packages/sheplang build
```

### Running Tests

```bash
# Test all packages
pnpm test

# Test a specific package
pnpm -C packages/shep-core test
```

### Using the CLI

```bash
# Build the CLI first
pnpm -C packages/shep-cli build

# Try the CLI
pnpm -C packages/shep-cli exec shep --help
```

## Key Design Decisions

1. **TypeScript Everywhere**: All source code is TypeScript with strict mode enabled
2. **Modular Architecture**: Each component is independently buildable and testable
3. **pnpm Workspaces**: Efficient monorepo management with workspace protocol
4. **Minimal Stubs**: Core infrastructure in place, implementation deferred to phases
5. **Clear Separation**: Language layers (core, sheplang, shepthon) are cleanly separated

## Next Steps

1. **Phase 1 (Current)**:
   - Implement lexer for tokenization
   - Implement parser for AST generation
   - Create basic type system
   - Add comprehensive tests

2. **Phase 2**:
   - Complete language parsing
   - Implement code generation
   - Add language-specific features

3. **Phase 3**:
   - Full LSP implementation
   - IDE integration
   - Development tooling

## Troubleshooting

### TypeScript Errors About Node Types

The `@types/node` package is included in dev dependencies. If you see errors about missing Node types, ensure dependencies are installed:

```bash
pnpm install
```

### Build Failures

Ensure you're building in the correct order:

```bash
# Build dependencies first
pnpm -C packages/shep-core build

# Then packages that depend on core
pnpm -C packages/sheplang build
pnpm -C packages/shepthon build

# Then packages that depend on those
pnpm -C packages/shep-cli build
```

Or simply build everything:

```bash
pnpm build
```

## Contributing

This is a fresh, clean codebase ready for development. All major components are scaffolded and ready for implementation.

See `docs/roadmap/00-high-level.md` for areas where contributions are needed.

## License

MIT (to be confirmed)
