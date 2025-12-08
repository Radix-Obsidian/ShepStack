# Publishing Shep to npm

This guide covers publishing ShepStack packages to npm following official npm and GitHub best practices.

## Prerequisites

- npm account at https://www.npmjs.com/settings/goldensheepai/packages
- npm CLI installed (`npm --version`)
- Authenticated with npm (`npm whoami`)
- Git repository with clean working directory

## Step 1: Verify Everything is Ready

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Check git status
git status

# Should be clean - no uncommitted changes
```

## Step 2: Update Versions

All packages are already set to `0.1.0` in package.json files:
- `package.json` (root)
- `packages/shep-cli/package.json`
- `packages/shep-core/package.json`
- `packages/shep-lsp/package.json`
- `packages/shepthon/package.json`

For future releases, update versions following [Semantic Versioning](https://semver.org/):
- Patch: `0.1.1` - Bug fixes
- Minor: `0.2.0` - New features
- Major: `1.0.0` - Breaking changes

## Step 3: Create Git Tag

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release v0.1.0: Production-ready MVP

- Auto-generated authentication
- Auto-generated admin dashboard
- One-command deployment
- Spec validation & linting
- Tailwind CSS + shadcn styling
- Advanced field types & constraints
- Computed fields"

# Push tag to GitHub
git push origin v0.1.0
```

## Step 4: Publish to npm

### Option A: Manual Publishing (Recommended for First Release)

```bash
# Login to npm (if not already authenticated)
npm login

# Build all packages
pnpm build

# Publish each package individually
# This gives you control and visibility

# Publish @shep/core first (no dependencies on other @shep packages)
cd packages/shep-core
npm publish

# Publish @shep/cli (depends on @shep/core)
cd ../shep-cli
npm publish

# Publish @shep/lsp (depends on @shep/core)
cd ../shep-lsp
npm publish

# Publish shepthon
cd ../shepthon
npm publish
```

### Option B: Automated Publishing (Using pnpm)

```bash
# From root directory
pnpm publish --recursive --access public
```

**Note:** This publishes all packages at once. Use Option A for more control.

## Step 5: Verify Publication

Check that packages are published:

```bash
# Check @shep/cli
npm view @shep/cli

# Check @shep/core
npm view @shep/core

# Check @shep/lsp
npm view @shep/lsp

# Check shepthon
npm view shepthon

# Install and test
npm install -g @shep/cli
shep --version
```

## Step 6: Create GitHub Release

1. Go to https://github.com/Radix-Obsidian/ShepStack/releases
2. Click "Draft a new release"
3. Select tag: `v0.1.0`
4. Title: `v0.1.0 - Production Ready`
5. Description:

```markdown
## 🎉 Production Ready MVP

Shep is now production-ready for non-technical founders to build full-stack applications.

### ✨ What's Included

- **Auto-generated Authentication** - JWT-based login/signup/logout
- **Auto-generated Admin Dashboard** - Beautiful CRUD UI for all entities
- **One-Command Deployment** - Deploy to Railway, Render, or Fly.io
- **Spec Validation & Linting** - L001-L011 best practice checks
- **Beautiful Styling** - Tailwind CSS + shadcn components
- **Advanced Field Types** - UUID, JSON, arrays, computed fields
- **Field Constraints** - min/max, regex, unique, default values

### 📦 Packages Published

- `@shep/cli` - Command-line tool
- `@shep/core` - Language core
- `@shep/lsp` - Language Server Protocol
- `shepthon` - Python code generation

### 🚀 Quick Start

```bash
npm install -g @shep/cli
shep new myapp
shep compile --input myapp.shep
shep deploy --provider railway
```

### 📚 Documentation

- [Getting Started](https://github.com/Radix-Obsidian/ShepStack/blob/main/docs/guides/getting-started.md)
- [Syntax Reference](https://github.com/Radix-Obsidian/ShepStack/blob/main/docs/guides/syntax-reference.md)
- [Deployment Guide](https://github.com/Radix-Obsidian/ShepStack/blob/main/docs/guides/deployment.md)

### 🙏 Thank You

Thanks to everyone who contributed to making Shep production-ready!
```

6. Click "Publish release"

## Step 7: Update GitHub Repository Settings

1. Go to https://github.com/Radix-Obsidian/ShepStack/settings
2. Under "General":
   - Description: "Write a spec. Get a full-stack app."
   - Homepage: `https://github.com/Radix-Obsidian/ShepStack`
   - Topics: `code-generation`, `spec-language`, `fullstack`, `typescript`, `python`, `fastapi`, `react`
3. Under "Pages":
   - Enable GitHub Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/docs`

## Step 8: Announce the Release

### Twitter/X

```
🎉 Shep v0.1.0 is live on npm!

Write a spec. Get a full-stack app.

✅ Auto-generated auth
✅ Admin dashboard
✅ One-command deploy
✅ Beautiful styling
✅ Production ready

npm install -g @shep/cli

https://github.com/Radix-Obsidian/ShepStack
```

### ProductHunt

Post on https://www.producthunt.com/ (optional but recommended)

### HackerNews

Post on https://news.ycombinator.com/submit (optional)

### GitHub Discussions

Create announcement in https://github.com/Radix-Obsidian/ShepStack/discussions

## Troubleshooting

### Package Already Published

If you get "You cannot publish over the previously published version":

```bash
# Increment version
# Update package.json version to 0.1.1
# Commit and tag
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1

# Publish again
npm publish
```

### Authentication Issues

```bash
# Check if logged in
npm whoami

# If not logged in
npm login

# If using 2FA
npm login --auth-type=web
```

### Publish Permissions

Make sure your npm account has access to the `@shep` organization:
https://www.npmjs.com/settings/goldensheepai/packages

## Future Releases

For future releases, follow this checklist:

- [ ] Update version in all `package.json` files
- [ ] Update `CHANGELOG.md`
- [ ] Run `pnpm build && pnpm test`
- [ ] Commit: `git commit -am "chore: release v0.2.0"`
- [ ] Tag: `git tag -a v0.2.0 -m "Release v0.2.0"`
- [ ] Push: `git push origin main --tags`
- [ ] Publish: `pnpm publish --recursive --access public`
- [ ] Create GitHub Release
- [ ] Announce on social media

## References

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm CLI Publish](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

---

**Ready to publish? Run the commands in Step 4 above!**
