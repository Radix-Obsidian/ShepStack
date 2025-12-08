/**
 * Shep Deploy Command
 *
 * One-command deployment for non-technical founders.
 * Deploys to Railway (backend) and Vercel (frontend).
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawn } from "child_process";

export const deployCommand = new Command("deploy")
  .description("Deploy your generated app to the cloud")
  .option("-i, --input <dir>", "Generated code directory", "./generated")
  .option("--backend-only", "Deploy only the backend")
  .option("--frontend-only", "Deploy only the frontend")
  .option("--provider <provider>", "Backend provider: railway, render, fly", "railway")
  .option("--dry-run", "Show what would be deployed without deploying")
  .action(async (options: DeployOptions) => {
    await runDeploy(options);
  });

interface DeployOptions {
  input: string;
  backendOnly?: boolean;
  frontendOnly?: boolean;
  provider: string;
  dryRun?: boolean;
}

async function runDeploy(options: DeployOptions): Promise<void> {
  console.log("\n🐑 Shep Deploy v0.1.0\n");

  const inputDir = path.resolve(options.input);
  const frontendDir = path.join(path.dirname(inputDir), "frontend");

  // Check if generated code exists
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Error: Generated code not found at ${inputDir}`);
    console.error(`\n   Run 'shep compile' first to generate code.\n`);
    process.exit(1);
  }

  // Check for required files
  const mainPy = path.join(inputDir, "main.py");
  if (!fs.existsSync(mainPy)) {
    console.error(`❌ Error: main.py not found. Run 'shep compile' first.\n`);
    process.exit(1);
  }

  if (options.dryRun) {
    console.log("🏃 Dry run mode - showing what would be deployed:\n");
    showDryRun(inputDir, frontendDir, options);
    return;
  }

  // Deploy backend
  if (!options.frontendOnly) {
    console.log("📦 Deploying backend...\n");
    await deployBackend(inputDir, options.provider);
  }

  // Deploy frontend
  if (!options.backendOnly && fs.existsSync(frontendDir)) {
    console.log("\n📦 Deploying frontend...\n");
    await deployFrontend(frontendDir);
  }

  console.log("\n🎉 Deployment complete!\n");
}

function showDryRun(inputDir: string, frontendDir: string, options: DeployOptions): void {
  console.log("Backend deployment:");
  console.log(`  Directory: ${inputDir}`);
  console.log(`  Provider: ${options.provider}`);
  console.log(`  Files:`);
  const backendFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.py') || f === 'requirements.txt');
  backendFiles.forEach(f => console.log(`    - ${f}`));

  if (fs.existsSync(frontendDir)) {
    console.log("\nFrontend deployment:");
    console.log(`  Directory: ${frontendDir}`);
    console.log(`  Provider: Vercel`);
  }

  console.log("\nTo deploy for real, run without --dry-run\n");
}

async function deployBackend(dir: string, provider: string): Promise<void> {
  switch (provider) {
    case "railway":
      await deployToRailway(dir);
      break;
    case "render":
      await deployToRender(dir);
      break;
    case "fly":
      await deployToFly(dir);
      break;
    default:
      console.error(`❌ Unknown provider: ${provider}`);
      console.error(`   Supported: railway, render, fly\n`);
      process.exit(1);
  }
}

async function deployToRailway(dir: string): Promise<void> {
  // Check if Railway CLI is installed
  try {
    execSync("railway --version", { stdio: "pipe" });
  } catch {
    console.log("⚠️  Railway CLI not found.\n");
    console.log("   Install it with: npm install -g @railway/cli");
    console.log("   Or visit: https://railway.app/\n");
    console.log("   Alternative: Deploy manually by:");
    console.log("   1. Create a Railway account at https://railway.app/");
    console.log("   2. Create a new project");
    console.log("   3. Deploy from GitHub or upload the generated folder\n");
    return;
  }

  // Check if logged in
  try {
    execSync("railway whoami", { stdio: "pipe" });
  } catch {
    console.log("   Please login to Railway first:");
    console.log("   railway login\n");
    return;
  }

  // Generate railway.json if not exists
  const railwayConfig = path.join(dir, "railway.json");
  if (!fs.existsSync(railwayConfig)) {
    const config = {
      "$schema": "https://railway.app/railway.schema.json",
      "build": {
        "builder": "NIXPACKS"
      },
      "deploy": {
        "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
        "restartPolicyType": "ON_FAILURE"
      }
    };
    fs.writeFileSync(railwayConfig, JSON.stringify(config, null, 2));
    console.log("   ✓ Created railway.json");
  }

  // Generate Procfile
  const procfile = path.join(dir, "Procfile");
  if (!fs.existsSync(procfile)) {
    fs.writeFileSync(procfile, "web: uvicorn main:app --host 0.0.0.0 --port $PORT\n");
    console.log("   ✓ Created Procfile");
  }

  console.log("   Deploying to Railway...");
  try {
    execSync("railway up", { cwd: dir, stdio: "inherit" });
    console.log("   ✓ Backend deployed to Railway!");
  } catch (error) {
    console.error("   ❌ Railway deployment failed");
    console.error("   Check the error above and try again.\n");
  }
}

async function deployToRender(dir: string): Promise<void> {
  console.log("   Render deployment via CLI not yet supported.");
  console.log("\n   Deploy manually:");
  console.log("   1. Go to https://render.com/");
  console.log("   2. Create a new Web Service");
  console.log("   3. Connect your GitHub repo or upload code");
  console.log("   4. Set build command: pip install -r requirements.txt");
  console.log("   5. Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT\n");

  // Generate render.yaml
  const renderConfig = path.join(dir, "render.yaml");
  if (!fs.existsSync(renderConfig)) {
    const config = `services:
  - type: web
    name: shep-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
`;
    fs.writeFileSync(renderConfig, config);
    console.log("   ✓ Created render.yaml - commit this to your repo\n");
  }
}

async function deployToFly(dir: string): Promise<void> {
  // Check if Fly CLI is installed
  try {
    execSync("fly version", { stdio: "pipe" });
  } catch {
    console.log("⚠️  Fly.io CLI not found.\n");
    console.log("   Install it with: curl -L https://fly.io/install.sh | sh");
    console.log("   Or visit: https://fly.io/docs/hands-on/install-flyctl/\n");
    return;
  }

  // Generate fly.toml if not exists
  const flyConfig = path.join(dir, "fly.toml");
  if (!fs.existsSync(flyConfig)) {
    const appName = `shep-${Date.now()}`;
    const config = `app = "${appName}"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
`;
    fs.writeFileSync(flyConfig, config);
    console.log("   ✓ Created fly.toml");
  }

  console.log("   Deploying to Fly.io...");
  try {
    execSync("fly deploy", { cwd: dir, stdio: "inherit" });
    console.log("   ✓ Backend deployed to Fly.io!");
  } catch (error) {
    console.error("   ❌ Fly.io deployment failed");
    console.error("   Check the error above and try again.\n");
  }
}

async function deployFrontend(dir: string): Promise<void> {
  // Check if Vercel CLI is installed
  try {
    execSync("vercel --version", { stdio: "pipe" });
  } catch {
    console.log("⚠️  Vercel CLI not found.\n");
    console.log("   Install it with: npm install -g vercel");
    console.log("   Or visit: https://vercel.com/\n");
    console.log("   Alternative: Deploy manually by:");
    console.log("   1. Push your code to GitHub");
    console.log("   2. Go to https://vercel.com/new");
    console.log("   3. Import your repository\n");
    return;
  }

  console.log("   Deploying to Vercel...");
  try {
    execSync("vercel --prod", { cwd: dir, stdio: "inherit" });
    console.log("   ✓ Frontend deployed to Vercel!");
  } catch (error) {
    console.error("   ❌ Vercel deployment failed");
    console.error("   Check the error above and try again.\n");
  }
}
