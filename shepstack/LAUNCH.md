# ShepLang Launch Strategy

## The Vision

**ShepLang is the first programming language with AI as a built-in verb.**

```
Human intent (natural language)
    ↓
AI generates ShepLang program
    ↓
Human reviews/edits ShepLang
    ↓
Compiler generates Python + JS + SQL
    ↓
Deploy to production
```

---

## Where to Publish & Why

### 1. npm (Primary Distribution) ✅ Launched

**Status:** All packages published and working!

**Why npm?**
- ShepLang compiler is TypeScript, npm is the native distribution
- Developers can install with `npm install -g @goldensheepai/shep-cli`
- Integrates with existing JS/TS toolchains

**Published Packages (v0.1.4):**
```
@goldensheepai/shep-cli       # The CLI (shep compile, shep verify, etc.)
@goldensheepai/shep-core      # Parser, verifier, types, AST
@goldensheepai/shep-lsp       # Language Server Protocol
@goldensheepai/shep-sheplang  # TypeScript/React code generation
@goldensheepai/shep-shepthon  # Python/FastAPI code generation
```

**Installation:**
```bash
# Install CLI globally
npm install -g @goldensheepai/shep-cli

# Verify it works
shep --version
shep --help
```

**Fixed Issues:**
- ✅ Resolved workspace:* protocol errors
- ✅ All dependencies now publish correctly
- ✅ Source imports use @goldensheepai/* scope
- ✅ npm install works without errors

### 2. VS Code Marketplace 🔜 Next Step

**Why VS Code?**
- 75% of developers use VS Code
- Syntax highlighting + LSP = instant productivity
- Zero friction adoption

**Extension Ready:** `editors/vscode-extension/`

**Publish Steps:**
1. Create Azure DevOps account
2. Get Personal Access Token
3. `npx vsce publish`

### 3. GitHub (Source of Truth) ✅ Ready

**Why GitHub?**
- Open source builds trust
- Issues/Discussions for community
- Actions for CI/CD
- Releases for versioned downloads

**URL:** https://github.com/Radix-Obsidian/ShepStack

### 4. Documentation Site 🔜 Future

**Options:**
- GitHub Pages (free, easy)
- Docusaurus (React-based, good for languages)
- GitBook (beautiful, easy)

---

## IDE Support Status

| IDE | Support | Status |
|-----|---------|--------|
| **VS Code** | Full | ✅ TextMate grammar + LSP ready |
| **Windsurf** | Full | ✅ Same as VS Code |
| **Cursor** | Full | ✅ Same as VS Code |
| **JetBrains** | Partial | 📋 TextMate import works |
| **Neovim** | Partial | 📋 TreeSitter grammar needed |
| **Emacs** | Partial | 📋 Major mode needed |

**Current VS Code Features:**
- ✅ Syntax highlighting
- ✅ Diagnostics (errors, warnings)
- ✅ Code completion
- ✅ Hover information
- ✅ Go to definition
- ✅ Find references

---

## Launch Channels

### Phase 1: Developer Early Adopters (Week 1-2)

| Channel | Action |
|---------|--------|
| **Hacker News** | "Show HN: ShepLang – first language with AI as a built-in verb" |
| **Reddit** | r/programming, r/ProgrammingLanguages, r/MachineLearning |
| **Twitter/X** | Thread showing the ai() primitive |
| **Dev.to** | Technical blog post |

### Phase 2: AI Community (Week 3-4)

| Channel | Action |
|---------|--------|
| **AI Twitter** | Target AI agent builders, LangChain community |
| **Discord** | Post in AI builder servers |
| **YouTube** | Demo video: "Build a SaaS in 5 minutes with AI" |

### Phase 3: Founder Community (Week 5-6)

| Channel | Action |
|---------|--------|
| **Product Hunt** | Official launch |
| **Indie Hackers** | Case study post |
| **LinkedIn** | Target technical founders |

---

## Key Messages

### For Developers

> "ShepLang is TypeScript for AI-generated code. AI writes it, you review it, it compiles to real Python and JavaScript."

### For Founders

> "Describe your product in ShepLang, get a working app. AI handles the writing, you handle the vision."

### For AI Builders

> "ShepLang is the intermediate representation for AI-generated software. High-level enough for LLMs to reason about, precise enough to compile."

---

## Launch Checklist

### Before Launch
- [x] npm packages published (v0.1.4)
- [x] All dependencies fixed (workspace:* → npm versions)
- [x] README.md updated with correct install instructions
- [x] SETUP.md updated with npm installation guide
- [ ] VS Code extension published
- [ ] GitHub README polished
- [ ] GitHub Discussions enabled
- [ ] GitHub Wiki created
- [ ] v0.1.4 release created (npm packages live)
- [ ] Demo video recorded
- [ ] Blog post written

### Launch Day
- [ ] Hacker News post
- [ ] Twitter thread
- [ ] Reddit posts
- [ ] Discord announcements

### After Launch
- [ ] Monitor GitHub issues
- [ ] Respond to comments
- [ ] Collect feedback
- [ ] Plan v0.2.0 based on feedback

---

## Success Metrics

| Metric | Target (30 days) |
|--------|-----------------|
| GitHub Stars | 500+ |
| npm Downloads | 1,000+ |
| VS Code Installs | 500+ |
| GitHub Discussions | 20+ |
| Contributors | 5+ |

---

*"Simplicity is the ultimate sophistication."* — Steve Jobs

The launch should be as simple and clear as the language itself.
