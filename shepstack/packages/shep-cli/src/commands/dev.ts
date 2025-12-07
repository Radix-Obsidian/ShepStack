/**
 * Shep Dev Command
 *
 * Watch mode with hot reload: monitors .shep files and regenerates code on changes.
 * The core development experience for iterating on specs.
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";
import { parseSpec, verifySpec } from "@shep/core";

// ============================================================================
// Command Definition
// ============================================================================

export const devCommand = new Command("dev")
  .description("Start development server with hot reload")
  .option("-i, --input <file>", "Input .shep file", "app.shep")
  .option("-o, --output <dir>", "Output directory", "./generated")
  .option("--backend-port <number>", "Backend server port", "3001")
  .option("--frontend-port <number>", "Frontend server port", "3000")
  .option("--no-backend", "Don't start backend server")
  .option("--no-frontend", "Don't start frontend server")
  .option("--no-watch", "Don't watch for changes (compile once)")
  .action(async (options: DevOptions) => {
    await runDev(options);
  });

// ============================================================================
// Types
// ============================================================================

interface DevOptions {
  input: string;
  output: string;
  backendPort: string;
  frontendPort: string;
  backend: boolean;
  frontend: boolean;
  watch: boolean;
}

interface ServerProcesses {
  backend?: ChildProcess;
  frontend?: ChildProcess;
}

// ============================================================================
// Main Dev Function
// ============================================================================

async function runDev(options: DevOptions): Promise<void> {
  console.log("\n🐑 Shep Dev Server v0.1.0\n");

  const inputPath = path.resolve(options.input);
  const outputDir = path.resolve(options.output);

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input file not found: ${inputPath}`);
    console.error(`\n   Create one with: shep new my-app\n`);
    process.exit(1);
  }

  // Initial compile
  console.log(`📖 Reading ${options.input}...`);
  const success = await compileSpec(inputPath, outputDir);
  
  if (!success) {
    console.error("\n❌ Initial compilation failed. Fix errors and try again.\n");
    process.exit(1);
  }

  // If no watch mode, exit here
  if (!options.watch) {
    console.log("\n✅ Compiled successfully (no-watch mode).\n");
    return;
  }

  // Start servers
  const servers: ServerProcesses = {};

  if (options.backend) {
    servers.backend = startBackendServer(outputDir, options.backendPort);
  }

  if (options.frontend) {
    servers.frontend = startFrontendServer(outputDir, options.frontendPort);
  }

  // Start file watcher
  console.log(`\n👀 Watching ${options.input} for changes...`);
  console.log("   Press Ctrl+C to stop.\n");

  startWatcher(inputPath, outputDir, servers, options);

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down...");
    cleanup(servers);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    cleanup(servers);
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}

// ============================================================================
// Compilation
// ============================================================================

async function compileSpec(inputPath: string, outputDir: string): Promise<boolean> {
  try {
    const source = fs.readFileSync(inputPath, "utf-8");
    const result = parseSpec(source, inputPath);

    if (!result.success || !result.spec) {
      console.error(`\n❌ Parse errors:`);
      for (const error of result.errors) {
        const loc = error.location
          ? `${error.location.line}:${error.location.column}`
          : "";
        console.error(`   ${loc} ${error.message}`);
      }
      return false;
    }

    // Verify spec
    const verification = verifySpec(result.spec);
    
    if (!verification.success) {
      console.error(`\n❌ Verification errors:`);
      for (const issue of verification.issues.filter(i => i.severity === "error")) {
        const loc = issue.location
          ? `${issue.location.line}:${issue.location.column}`
          : "";
        console.error(`   [${issue.code}] ${loc} ${issue.message}`);
      }
      return false;
    }

    // Show warnings
    const warnings = verification.issues.filter(i => i.severity === "warning");
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${warnings.length} warning(s)`);
    }

    // Generate code using the compile command logic
    // For now, we'll shell out to the compile command
    const { execSync } = await import("child_process");
    
    try {
      execSync(
        `node "${path.join(__dirname, "../../bin/shep.js")}" compile --input "${inputPath}" --output "${outputDir}"`,
        { stdio: "pipe" }
      );
      console.log(`✅ Compiled to ${outputDir}/`);
      return true;
    } catch {
      // Compilation already handles its own errors
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    return false;
  }
}

// ============================================================================
// File Watcher
// ============================================================================

function startWatcher(
  inputPath: string,
  outputDir: string,
  servers: ServerProcesses,
  options: DevOptions
): void {
  let debounceTimer: NodeJS.Timeout | null = null;
  let isCompiling = false;

  fs.watch(inputPath, { persistent: true }, (eventType) => {
    if (eventType !== "change") return;
    if (isCompiling) return;

    // Debounce rapid changes
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      isCompiling = true;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n🔄 [${timestamp}] Change detected, recompiling...`);

      const success = await compileSpec(inputPath, outputDir);

      if (success) {
        // Restart backend if needed
        if (servers.backend && options.backend) {
          console.log("   Restarting backend server...");
          servers.backend.kill();
          servers.backend = startBackendServer(outputDir, options.backendPort);
        }
        console.log(`   ✅ Hot reload complete!`);
      } else {
        console.log(`   ❌ Compilation failed. Fix errors and save again.`);
      }

      isCompiling = false;
    }, 300);
  });

  // Also watch for new .shep files in the same directory
  const inputDir = path.dirname(inputPath);
  fs.watch(inputDir, { persistent: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".shep") && filename !== path.basename(inputPath)) {
      console.log(`   📄 New .shep file detected: ${filename}`);
    }
  });
}

// ============================================================================
// Server Management
// ============================================================================

function startBackendServer(outputDir: string, port: string): ChildProcess {
  console.log(`🚀 Starting backend server on http://localhost:${port}`);

  const mainPy = path.join(outputDir, "main.py");
  
  if (!fs.existsSync(mainPy)) {
    console.log(`   ⚠️  No main.py found. Backend server not started.`);
    return spawn("echo", ["Backend not available"]);
  }

  const proc = spawn("uvicorn", ["main:app", "--reload", "--port", port, "--host", "0.0.0.0"], {
    cwd: outputDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
  });

  proc.stdout?.on("data", (data) => {
    const line = data.toString().trim();
    if (line && !line.includes("Uvicorn running") && !line.includes("Started reloader")) {
      console.log(`   [backend] ${line}`);
    }
  });

  proc.stderr?.on("data", (data) => {
    const line = data.toString().trim();
    // Filter out noisy uvicorn logs
    if (line && !line.includes("INFO:") && !line.includes("Waiting for")) {
      console.log(`   [backend] ${line}`);
    }
  });

  proc.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`   ⚠️  uvicorn not found. Install with: pip install uvicorn`);
    }
  });

  return proc;
}

function startFrontendServer(outputDir: string, port: string): ChildProcess {
  const frontendDir = path.join(path.dirname(outputDir), "frontend");
  
  console.log(`🚀 Starting frontend server on http://localhost:${port}`);

  if (!fs.existsSync(frontendDir)) {
    console.log(`   ⚠️  No frontend/ directory found. Frontend server not started.`);
    return spawn("echo", ["Frontend not available"]);
  }

  const packageJson = path.join(frontendDir, "package.json");
  if (!fs.existsSync(packageJson)) {
    console.log(`   ⚠️  No package.json found in frontend/. Run 'npm install' first.`);
    return spawn("echo", ["Frontend not configured"]);
  }

  const proc = spawn("npm", ["run", "dev", "--", "--port", port], {
    cwd: frontendDir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  proc.stdout?.on("data", (data) => {
    const line = data.toString().trim();
    if (line && !line.includes("ready started") && !line.includes("Local:")) {
      console.log(`   [frontend] ${line}`);
    }
  });

  proc.stderr?.on("data", (data) => {
    const line = data.toString().trim();
    if (line) {
      console.log(`   [frontend] ${line}`);
    }
  });

  proc.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`   ⚠️  npm not found. Install Node.js first.`);
    }
  });

  return proc;
}

// ============================================================================
// Cleanup
// ============================================================================

function cleanup(servers: ServerProcesses): void {
  if (servers.backend) {
    servers.backend.kill();
  }
  if (servers.frontend) {
    servers.frontend.kill();
  }
}
