# 🐑 Shep

**Write a spec. Get a full-stack app.**

The fastest way for non-technical founders to build production applications. Shep generates Python (FastAPI) + TypeScript (React) + SQL from a simple specification language.

[![npm version](https://img.shields.io/npm/v/@shep/cli?style=flat-square)](https://www.npmjs.com/package/@shep/cli)
[![npm downloads](https://img.shields.io/npm/dm/@shep/cli?style=flat-square)](https://www.npmjs.com/package/@shep/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/Radix-Obsidian/ShepStack?style=flat-square)](https://github.com/Radix-Obsidian/ShepStack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square)](https://nodejs.org/)

## ✨ What You Get

✅ **Full-Stack Code Generation** - Python (FastAPI) + TypeScript (React) + PostgreSQL  
✅ **Auto-Generated Authentication** - JWT-based login/signup/logout  
✅ **Admin Dashboard** - Beautiful CRUD UI for all entities  
✅ **One-Command Deployment** - Deploy to Railway, Render, or Fly.io  
✅ **Beautiful Styling** - Tailwind CSS + shadcn components  
✅ **Type Safety** - End-to-end TypeScript + Pydantic validation  
✅ **AI-Ready** - Built-in support for AI fields and rules  
✅ **Production Ready** - Spec validation, linting, error suggestions  

## 🚀 Quick Start

```bash
# Install globally
npm install -g @shep/cli

# Create a new app
shep new myapp

# Compile the spec
shep compile --input myapp.shep

# Deploy to the cloud
shep deploy --provider railway
```

## 📝 Example Spec

```shep
app "TaskManager"
  description: "Simple task management app"
  version: "1.0"

entity Task:
  fields:
    - title: text (required)
    - description: text
    - completed: boolean
    - dueDate: date
    - priority: enum(low, medium, high)

screen TaskList (list):
  entity: Task
  fields: [title, dueDate, priority, completed]

screen TaskForm (form):
  entity: Task
  fields: [title, description, dueDate, priority]

flow "Create Task":
  1. User opens TaskForm
  2. User fills in fields
  3. User clicks Save
  4. Task is created
```

**Generated automatically:**

- ✅ FastAPI backend with CRUD routes
- ✅ React components with forms and lists
- ✅ PostgreSQL schema with migrations
- ✅ JWT authentication system
- ✅ Admin dashboard
- ✅ Tailwind-styled components
- ✅ TypeScript types for frontend
- ✅ Pydantic models for backend

## 📚 Documentation

- **[Getting Started](./docs/guides/getting-started.md)** - Installation and first app
- **[Syntax Reference](./docs/guides/syntax-reference.md)** - Complete language reference
- **[Deployment Guide](./docs/guides/deployment.md)** - Deploy to production
- **[Roadmap](./docs/roadmap/00-high-level.md)** - What's coming next
- **[Philosophy](./docs/spec/shep-philosophy.md)** - Design principles

## 🏗️ Architecture

Shep is a vertical-slice, spec-first language stack for building modern applications. Rather than building monolithic applications, Shep enables you to define self-contained, end-to-end features that span from data models through API endpoints to UI components.

The stack provides multiple language targets:

- **@shep/core**: Shared language core (parser, verifier, type system)
- **@shep/cli**: Developer CLI (compile, verify, deploy)
- **@shep/lsp**: Language Server Protocol for editor integration
- **shepthon**: Python code generation (FastAPI, Pydantic)

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@shep/cli` | [![npm](https://img.shields.io/npm/v/@shep/cli?style=flat-square)](https://www.npmjs.com/package/@shep/cli) | Command-line tool for compiling, verifying, and deploying |
| `@shep/core` | [![npm](https://img.shields.io/npm/v/@shep/core?style=flat-square)](https://www.npmjs.com/package/@shep/core) | Language core (parser, verifier, type system) |
| `@shep/lsp` | [![npm](https://img.shields.io/npm/v/@shep/lsp?style=flat-square)](https://www.npmjs.com/package/@shep/lsp) | Language Server Protocol for editor integration |
| `shepthon` | [![npm](https://img.shields.io/npm/v/shepthon?style=flat-square)](https://www.npmjs.com/package/shepthon) | Python code generation (FastAPI, Pydantic) |

## 🏗️ Project Structure

```bash
shepstack/
├── packages/
│   ├── shep-core/        # Parser, verifier, type system
│   ├── shep-cli/         # CLI tool (compile, verify, deploy)
│   ├── shep-lsp/         # Language Server Protocol
│   └── shepthon/         # Python code generation
├── editors/
│   └── vscode-extension/ # VS Code extension
├── examples/
│   └── support-ai/       # Example with AI features
├── docs/
│   ├── guides/           # User guides
│   └── roadmap/          # Development roadmap
└── README.md
```

## 🔧 Development

This is a pnpm workspace monorepo. Each package is independently versioned and published.

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

### Scripts

```bash
pnpm build       # Build all packages
pnpm lint        # Lint all packages
pnpm test        # Run tests
pnpm dev         # Start development server
```

### Making Changes

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Commit: `git commit -am 'feat: add my feature'`
5. Push: `git push origin feat/my-feature`
6. Open a PR

## 🎯 Features

### Phase 4: Production Ready ✅

- [x] Auto-generated authentication (JWT-based)
- [x] Auto-generated admin dashboard
- [x] One-command deployment (Railway, Render, Fly.io)
- [x] Better error messages with suggestions
- [x] Spec validation & linting (L001-L011)
- [x] Tailwind CSS + shadcn styling
- [x] Advanced field types (UUID, JSON, arrays)
- [x] Field constraints (min/max, regex, unique, default)
- [x] Computed fields

### Phase 5: Coming Soon 🚀

- [ ] AI-assisted spec writing (`shep draft`)
- [ ] Database migrations
- [ ] Custom hooks & middleware
- [ ] Multi-tenancy support
- [ ] GraphQL support
- [ ] Real-time subscriptions

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT - See [LICENSE](./LICENSE)

## 🙋 Support

- 💬 [GitHub Discussions](https://github.com/Radix-Obsidian/ShepStack/discussions)
- 🐛 [Report Issues](https://github.com/Radix-Obsidian/ShepStack/issues)
- 📧 [Email](mailto:hello@shep.dev)

## 🌟 Built With

- **TypeScript** - Type-safe language
- **FastAPI** - Python web framework
- **React** - UI library
- **Tailwind CSS** - Styling
- **Pydantic** - Data validation
- **PostgreSQL** - Database
- **JWT** - Authentication

---

**Made with ❤️ for non-technical founders who want to build fast.**
