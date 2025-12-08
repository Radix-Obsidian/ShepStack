# ShepLang for VS Code

Language support for ShepLang in Visual Studio Code.

## Features

| Feature | Status |
|---------|--------|
| Syntax highlighting | 🚧 In progress |
| Diagnostics | 📋 Planned |
| Code completion | 📋 Planned |
| Hover information | 📋 Planned |
| Go to definition | 📋 Planned |

## Installation

This extension is part of the ShepLang mono-repo and is not yet published to the VS Code marketplace.

For development, open the `editors/vscode-extension` folder in VS Code and press F5 to launch a test instance.

## Development

```bash
# Build the extension
pnpm -C editors/vscode-extension build

# Run tests
pnpm -C editors/vscode-extension test
```

## File Associations

The extension registers `.shep` files as ShepLang programs.

---

*ShepLang: A programming language for the AI era.*
