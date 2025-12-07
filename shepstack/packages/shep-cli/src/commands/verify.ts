/**
 * Shep Verify Command
 *
 * Verifies a .shep spec without generating code.
 * Catches errors at compile time, not runtime.
 *
 * "If it compiles, it works. If it's wired, it ships."
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { parseSpec, verifySpec, VerificationResult, VerificationIssue } from "@shep/core";

// ============================================================================
// Command Definition
// ============================================================================

export const verifyCommand = new Command("verify")
  .description("Verify a .shep spec without generating code")
  .argument("<input>", "Path to .shep file or directory")
  .option("--strict", "Treat warnings as errors")
  .option("--quiet", "Only show errors, not warnings or info")
  .option("--json", "Output results as JSON")
  .option("--fix-suggestions", "Show fix suggestions for each issue")
  .action(async (input: string, options: VerifyOptions) => {
    await runVerify(input, options);
  });

// ============================================================================
// Types
// ============================================================================

interface VerifyOptions {
  strict?: boolean;
  quiet?: boolean;
  json?: boolean;
  fixSuggestions?: boolean;
}

// ============================================================================
// Main Verify Function
// ============================================================================

async function runVerify(input: string, options: VerifyOptions): Promise<void> {
  console.log("\n🐑 Shep Verify v0.1.0\n");

  // Resolve input path
  const inputPath = path.resolve(input);

  // Check if input exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input not found: ${inputPath}`);
    process.exit(1);
  }

  // Find .shep files
  const shepFiles: string[] = [];
  if (fs.statSync(inputPath).isDirectory()) {
    const files = fs.readdirSync(inputPath);
    for (const file of files) {
      if (file.endsWith(".shep")) {
        shepFiles.push(path.join(inputPath, file));
      }
    }
    if (shepFiles.length === 0) {
      console.error(`❌ Error: No .shep files found in ${inputPath}`);
      process.exit(1);
    }
  } else if (inputPath.endsWith(".shep")) {
    shepFiles.push(inputPath);
  } else {
    console.error(`❌ Error: Input must be a .shep file or directory: ${inputPath}`);
    process.exit(1);
  }

  // Verify each file
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;
  const allResults: { file: string; result: VerificationResult }[] = [];

  for (const shepFile of shepFiles) {
    console.log(`📋 Verifying ${path.basename(shepFile)}...\n`);

    try {
      // Read and parse the file
      const content = fs.readFileSync(shepFile, "utf-8");
      const parseResult = parseSpec(content);
      if (!parseResult.success) {
        console.error(`❌ Parse error in ${path.basename(shepFile)}:`);
        for (const err of parseResult.errors) {
          console.error(`   Line ${err.location?.line || "?"}: ${err.message}`);
        }
        totalErrors++;
        continue;
      }
      const spec = parseResult.spec!;

      // Verify the spec
      const result = verifySpec(spec);
      allResults.push({ file: shepFile, result });

      // Count issues
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;
      totalInfo += result.issues.filter((i) => i.severity === "info").length;

      // Display results
      if (options.json) {
        // JSON output handled at the end
      } else {
        displayResult(result, options);
        displaySummary(result);
      }
    } catch (error) {
      console.error(`❌ Parse error in ${path.basename(shepFile)}:`);
      console.error(`   ${(error as Error).message}`);
      totalErrors++;
    }
  }

  // JSON output
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          files: allResults.map((r) => ({
            file: r.file,
            success: r.result.success,
            errors: r.result.errorCount,
            warnings: r.result.warningCount,
            issues: r.result.issues,
            summary: r.result.summary,
          })),
          totals: {
            errors: totalErrors,
            warnings: totalWarnings,
            info: totalInfo,
          },
        },
        null,
        2
      )
    );
    process.exit(totalErrors > 0 ? 1 : 0);
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Verification Summary");
  console.log("=".repeat(60));

  if (shepFiles.length > 1) {
    console.log(`\n   Files verified: ${shepFiles.length}`);
  }

  console.log(`   Errors:   ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  console.log(`   Info:     ${totalInfo}`);

  // Determine exit status
  const hasFailure = options.strict ? totalErrors + totalWarnings > 0 : totalErrors > 0;

  if (hasFailure) {
    console.log("\n❌ Verification failed.\n");
    process.exit(1);
  } else {
    console.log("\n✅ Verification passed!\n");
    console.log('   "If it compiles, it works. If it\'s wired, it ships."\n');
    process.exit(0);
  }
}

// ============================================================================
// Display Functions
// ============================================================================

function displayResult(result: VerificationResult, options: VerifyOptions): void {
  const issues = options.quiet
    ? result.issues.filter((i) => i.severity === "error")
    : result.issues;

  if (issues.length === 0) {
    console.log("   No issues found.\n");
    return;
  }

  // Group issues by severity
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const info = issues.filter((i) => i.severity === "info");

  // Display errors first
  if (errors.length > 0) {
    console.log("   🔴 Errors:");
    for (const issue of errors) {
      displayIssue(issue, options);
    }
    console.log();
  }

  // Display warnings
  if (warnings.length > 0 && !options.quiet) {
    console.log("   🟡 Warnings:");
    for (const issue of warnings) {
      displayIssue(issue, options);
    }
    console.log();
  }

  // Display info
  if (info.length > 0 && !options.quiet) {
    console.log("   🔵 Info:");
    for (const issue of info) {
      displayIssue(issue, options);
    }
    console.log();
  }
}

function displayIssue(issue: VerificationIssue, options: VerifyOptions): void {
  const locationStr = issue.location
    ? ` (line ${issue.location.line}, col ${issue.location.column})`
    : "";

  console.log(`      [${issue.code}]${locationStr}`);
  console.log(`      ${issue.message}`);

  if (options.fixSuggestions && issue.suggestion) {
    console.log(`      💡 Fix: ${issue.suggestion}`);
  }

  console.log();
}

function displaySummary(result: VerificationResult): void {
  const { summary } = result;

  console.log("   📊 Verified:");
  console.log(`      - ${summary.entitiesVerified} entities`);
  console.log(`      - ${summary.screensVerified} screens`);
  console.log(`      - ${summary.flowsVerified} flows`);
  console.log(`      - ${summary.rulesVerified} rules`);
  console.log(`      - ${summary.integrationsVerified} integrations`);
  console.log(`      - ${summary.eventsVerified} events`);
  console.log(`      - ${summary.relationshipsVerified} relationships`);
  console.log(`      - ${summary.wiringChecks} wiring checks`);
}
