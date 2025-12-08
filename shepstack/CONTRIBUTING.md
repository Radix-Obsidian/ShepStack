# Contributing to Shep

We love contributions! Whether it's bug reports, feature requests, or code contributions, we appreciate your help in making Shep better.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Radix-Obsidian/ShepStack.git
cd shepstack

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/my-feature
# or for bug fixes:
git checkout -b fix/my-bug
```

### 2. Make Your Changes

- Follow the existing code style
- Use TypeScript with strict mode
- Add tests for new features
- Update documentation as needed

### 3. Run Tests & Lint

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -am "feat: add new field type validation"
git commit -am "fix: resolve parser error with enum values"
git commit -am "docs: update syntax reference"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build, dependencies, etc.

### 5. Push & Open a PR

```bash
git push origin feat/my-feature
```

Then open a Pull Request on GitHub with:
- Clear title describing the change
- Description of what and why
- Reference to any related issues (#123)

## Code Style

### TypeScript

- Use strict mode
- Add types to all function parameters and returns
- Use meaningful variable names
- Keep functions small and focused

### Formatting

We use Prettier for code formatting. Run before committing:

```bash
pnpm lint --fix
```

### Comments

- Add JSDoc comments to exported functions
- Explain complex logic
- Keep comments up-to-date with code

## Testing

### Writing Tests

- Place tests next to the code they test
- Use descriptive test names
- Test both happy path and error cases

### Running Tests

```bash
pnpm test
pnpm test --watch
```

## Documentation

### Updating Docs

- Update `/docs/guides/` for user-facing docs
- Update `/docs/spec/` for language specification
- Update `/docs/roadmap/` for planning

### README

- Keep the main README concise
- Link to detailed docs for complex topics
- Include examples

## Package Structure

This is a pnpm workspace monorepo:

- `packages/shep-core/` - Language core (parser, verifier, types)
- `packages/shep-cli/` - CLI tool
- `packages/shep-lsp/` - Language Server Protocol
- `packages/shepthon/` - Python code generation
- `editors/vscode-extension/` - VS Code extension

### Publishing

Each package is independently versioned. To publish:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit: `git commit -am "chore: release v0.1.0"`
4. Tag: `git tag v0.1.0`
5. Push: `git push origin main --tags`

GitHub Actions will automatically publish to npm.

## Reporting Issues

### Bug Reports

Include:
- Clear title
- Reproduction steps
- Expected vs actual behavior
- Environment (OS, Node version, Shep version)
- Error messages/logs

### Feature Requests

Include:
- Clear title
- Use case/motivation
- Proposed solution (if any)
- Examples

## Code Review

All PRs require review before merging. Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Breaking changes

## Questions?

- Open a [GitHub Discussion](https://github.com/Radix-Obsidian/ShepStack/discussions)
- Check existing [Issues](https://github.com/Radix-Obsidian/ShepStack/issues)
- Email: hello@shep.dev

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Shep! 🐑
