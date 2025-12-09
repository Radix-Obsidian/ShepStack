# Solution: Fix npm install for @goldensheepai/shep-cli

## Problem Summary
When running `npm install -g @goldensheepai/shep-cli`, you get:
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

## Root Cause
The published npm packages contain `workspace:*` references instead of actual version numbers. This is a **pnpm monorepo feature** that npm doesn't understand.

**Affected Packages:**
- `@goldensheepai/shep-cli@0.1.2` depends on:
  - `@goldensheepai/shep-core: workspace:*` ❌ (should be `0.1.2`)
  - `@goldensheepai/shep-sheplang: workspace:*` ❌ (should be `0.1.2`)
  - `@goldensheepai/shep-shepthon: workspace:*` ❌ (should be `0.1.2`)

- `@goldensheepai/shep-sheplang@0.1.2` depends on:
  - `@goldensheepai/shep-core: workspace:*` ❌ (should be `0.1.2`)

## Why This Happened
When pnpm publishes packages from a monorepo, it should automatically convert `workspace:*` references to actual version numbers. However, this conversion didn't happen during your publish step.

## Solutions

### ✅ RECOMMENDED: Fix the Publishing Process

You need to use `pnpm publish` instead of `npm publish` (if that's what you used), or ensure the build step converts workspace references.

**Steps:**
1. Ensure you're using pnpm: `pnpm install` (don't use npm in the project)
2. Build the project: `pnpm build`
3. Publish with pnpm: `pnpm -r publish`

**OR** if you need to use npm registry but haven't set up the build correctly:

1. Use `pnpm` for everything in this project (already configured)
2. Add a prepublish script that resolves workspace references

### 🔧 WORKAROUND: Install Locally

**For development**, you can install the CLI locally without publishing:

```bash
# From the root of shepstack project
pnpm install
pnpm build
pnpm -C packages/shep-cli link -g
```

Then use `shep` command from anywhere.

To unlink later:
```bash
pnpm -C packages/shep-cli unlink -g
```

### 📋 For Users: Use with pnpm

Users should install with pnpm until the npm packages are fixed:

```bash
# Install pnpm if needed
npm install -g pnpm

# Then install the CLI
pnpm add -g @goldensheepai/shep-cli
```

## What NOT to Do
- ❌ Don't use `npm install` or `npm publish` in this pnpm monorepo
- ❌ Don't manually edit package.json files to change `workspace:*` (this will break the build process)
- ❌ Don't remove pnpm-workspace.yaml

## Recommended Next Steps

1. **Prevent future issues:** Add a `.npmrc` file to enforce pnpm:
   ```
   engine-strict=true
   ```

2. **Document in README:**
   - This is a pnpm monorepo
   - Users should install with: `pnpm add -g @goldensheepai/shep-cli`
   - Or: `npm install -g pnpm && pnpm add -g @goldensheepai/shep-cli`

3. **Fix current npm packages:**
   - Increment version to 0.1.3
   - Ensure pnpm is used for all builds/publishes
   - Run: `pnpm -r build && pnpm -r publish`

## Verification

After fixing, verify the published packages:
```bash
npm view @goldensheepai/shep-cli dependencies
# Should show version numbers, not "workspace:*"
```
