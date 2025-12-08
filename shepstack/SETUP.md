# ShepLang Development Setup

## Repository Structure

This is the ShepLang compiler and toolchain mono-repo:

```
shepstack/
├── packages/
│   ├── shep-core/          # Core language types, tokens, AST, type system
│   ├── sheplang/           # TypeScript-targeting DSL compiler
│   ├── shepthon/           # Python-targeting compiler
│   └── shep-cli/           # Developer CLI tool
├── editors/
│   └── vscode-extension/   # VS Code extension (skeleton)
├── packages/
│   └── shep-lsp/           # Language Server Protocol (skeleton)
├── examples/
│   └── budget-dashboard/   # Reference implementation example
├── docs/
│   ├── spec/               # Language specifications
│   └── roadmap/            # Development roadmap
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # Workspace definition
├── tsconfig.base.json      # Shared TypeScript config
└── README.md               # Project overview
```

## Installation

1. **Install dependencies**:
   ```bash
   cd shepstack
   pnpm install
   ```

2. **Build all packages**:
   ```bash
   pnpm build
   ```

3. **Run tests**:
   ```bash
   pnpm test
   ```

## Project Structure

### Core Packages

- **`@shep/core`**: Foundation types and interfaces
  - Token types and lexer scaffold
  - AST node definitions
  - Type system primitives
  - Parser scaffold

- **`@shep/sheplang`**: TypeScript-targeting compiler
  - Sheplang-specific parsing (Phase 2)
  - TypeScript code generation
  - Configuration options

- **`@shep/shepthon`**: Python-targeting compiler
  - Shepthon-specific parsing (Phase 2)
  - Python code generation
  - Configuration options

- **`@shep/cli`**: Developer command-line interface
  - `shep compile` - Compile Shep files
  - `shep dev` - Development server (Phase 3)
  - `shep new` - Project scaffolding (Phase 3)

### Editor Integration

- **`@shep/lsp`**: Language Server Protocol
  - Basic LSP scaffolding
  - Document management
  - Extensible for Phase 3 features

- **`vscode-extension`**: VS Code extension
  - Language registration
  - Extension activation
  - LSP client wiring (Phase 3)

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
