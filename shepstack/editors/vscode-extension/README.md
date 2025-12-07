# Shep Language Support for VS Code

Provides language support for Shep in Visual Studio Code.

## Features

- Syntax highlighting for `.sheplang` and `.shepthon` files
- Language Server Protocol integration (coming in Phase 3)
- Diagnostics and error reporting (coming in Phase 3)
- Code completion (coming in Phase 3)
- Go to definition (coming in Phase 3)

## Installation

This extension is part of the Shepstack mono-repo and is not yet published to the VS Code marketplace.

## Development

```bash
# Build the extension
pnpm -C editors/vscode-extension build

# Run tests
pnpm -C editors/vscode-extension test
```

## Roadmap

- [ ] Full LSP integration
- [ ] Syntax highlighting
- [ ] Code completion
- [ ] Diagnostics
- [ ] Go to definition
- [ ] Hover information
- [ ] Refactoring support
