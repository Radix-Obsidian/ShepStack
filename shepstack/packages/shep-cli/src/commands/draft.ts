/**
 * Shep Draft Command
 *
 * AI-assisted spec writing: generates a .shep file from plain English.
 * The killer feature that makes Shep accessible to non-technical founders.
 *
 * "I want a SaaS for dog groomers" → complete .shep spec
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================================================================
// Command Definition
// ============================================================================

export const draftCommand = new Command("draft")
  .description("Generate a .shep spec from plain English using AI")
  .argument("[description]", "Plain English description of your app")
  .option("-o, --output <file>", "Output file path", "app.shep")
  .option("-i, --interactive", "Interactive mode - ask clarifying questions")
  .option("--provider <provider>", "AI provider: claude or openai", "claude")
  .option("--model <model>", "Model to use (default: claude-3-5-sonnet or gpt-4)")
  .option("--dry-run", "Show generated spec without saving")
  .action(async (description: string | undefined, options: DraftOptions) => {
    await runDraft(description, options);
  });

// ============================================================================
// Types
// ============================================================================

interface DraftOptions {
  output: string;
  interactive?: boolean;
  provider: "claude" | "openai";
  model?: string;
  dryRun?: boolean;
}

interface AppRequirements {
  description: string;
  features?: string[];
  userTypes?: string[];
  integrations?: string[];
}

// ============================================================================
// Main Draft Function
// ============================================================================

async function runDraft(description: string | undefined, options: DraftOptions): Promise<void> {
  console.log("\n🐑 Shep Draft v0.1.0");
  console.log("   AI-assisted spec writing\n");

  // Get description interactively if not provided
  let requirements: AppRequirements;
  
  if (options.interactive || !description) {
    requirements = await gatherRequirementsInteractively(description);
  } else {
    requirements = { description };
  }

  console.log("\n🤖 Generating spec with AI...\n");

  // Check for API key
  const apiKey = options.provider === "claude" 
    ? process.env.ANTHROPIC_API_KEY 
    : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(`❌ Error: ${options.provider === "claude" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} not set.`);
    console.error(`\n   Set it with: export ${options.provider === "claude" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"}=your-key\n`);
    process.exit(1);
  }

  try {
    // Generate the spec
    const spec = await generateSpecWithAI(requirements, options, apiKey);

    if (options.dryRun) {
      console.log("📝 Generated spec (dry run):\n");
      console.log("─".repeat(60));
      console.log(spec);
      console.log("─".repeat(60));
      console.log("\n   Use without --dry-run to save to file.\n");
      return;
    }

    // Save the spec
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, spec);

    console.log(`✅ Generated ${outputPath}\n`);
    console.log("   Next steps:");
    console.log(`   1. Review and edit ${options.output}`);
    console.log(`   2. Run: shep verify ${options.output}`);
    console.log(`   3. Run: shep compile --input ${options.output} --output generated\n`);
  } catch (error) {
    console.error(`\n❌ Error generating spec: ${(error as Error).message}\n`);
    process.exit(1);
  }
}

// ============================================================================
// Interactive Requirements Gathering
// ============================================================================

async function gatherRequirementsInteractively(initialDescription?: string): Promise<AppRequirements> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  };

  console.log("📋 Let's understand what you want to build.\n");

  // Get main description
  let description = initialDescription;
  if (!description) {
    description = await question("   What do you want to build?\n   > ");
  } else {
    console.log(`   Building: ${description}\n`);
  }

  // Ask clarifying questions
  const features = await question("\n   What are the main features? (comma-separated, or press Enter to skip)\n   > ");
  const userTypes = await question("\n   What types of users will use it? (comma-separated, or press Enter to skip)\n   > ");
  const integrations = await question("\n   Any integrations needed? (e.g., Stripe, Claude, SendGrid - comma-separated)\n   > ");

  rl.close();

  return {
    description,
    features: features ? features.split(",").map((f) => f.trim()) : undefined,
    userTypes: userTypes ? userTypes.split(",").map((u) => u.trim()) : undefined,
    integrations: integrations ? integrations.split(",").map((i) => i.trim()) : undefined,
  };
}

// ============================================================================
// AI Spec Generation
// ============================================================================

async function generateSpecWithAI(
  requirements: AppRequirements,
  options: DraftOptions,
  apiKey: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(requirements);

  if (options.provider === "claude") {
    return await callClaude(systemPrompt, userPrompt, apiKey, options.model);
  } else {
    return await callOpenAI(systemPrompt, userPrompt, apiKey, options.model);
  }
}

function buildSystemPrompt(): string {
  return `You are an expert at writing Shep specification files. Shep is a spec-first language that generates Python (FastAPI) backends and TypeScript (React) frontends.

Your job is to take a plain English description of an app and generate a complete, valid .shep specification file.

## Shep Syntax Reference

\`\`\`shep
app "AppName"
  description: "What this app does"
  version: "1.0"

# Entities define your data model
entity EntityName:
  fields:
    - fieldName: type (required)
    - optionalField: type
  
# Field types: text, number, money, email, date, datetime, boolean, file, image
# Special types:
#   - enum(value1, value2, value3)
#   - relationship(EntityName)
#   - list(EntityName)
#   - ai("prompt to compute this field")

# Screens define your UI
screen ScreenName (kind):
  entity: EntityName
  fields: [field1, field2]

# Screen kinds: form, list, detail, dashboard, wizard

# Flows describe user journeys (numbered steps)
flow "Flow Name":
  1. Description of step 1
  2. Description of step 2
  ai: AI does something  # AI-powered step

# Rules define business logic
rule "Rule Name":
  if condition → action

# AI-powered rules:
rule "Rule Name":
  if ai(entity.field, "condition description") → action

# Integrations declare external services
integration IntegrationName:
  purpose: "what it's for"

# Events for analytics/tracking
event EventName:
  fields: [field1, field2]
\`\`\`

## Guidelines

1. **Be comprehensive** - Include all entities needed for the described app
2. **Use AI primitives** - Add ai() fields and rules where intelligent behavior helps
3. **Include common patterns**:
   - User/Account entities if authentication is implied
   - created_at/updated_at timestamps
   - status enums for stateful entities
4. **Add realistic flows** - Map out actual user journeys
5. **Include integrations** - Claude for AI, Stripe for payments, etc.
6. **Write clear rules** - Business logic that makes the app work

Output ONLY the .shep file content, no explanations or markdown code blocks.`;
}

function buildUserPrompt(requirements: AppRequirements): string {
  let prompt = `Generate a complete .shep specification for the following app:\n\n`;
  prompt += `**Description:** ${requirements.description}\n`;

  if (requirements.features && requirements.features.length > 0) {
    prompt += `\n**Key Features:**\n`;
    for (const feature of requirements.features) {
      prompt += `- ${feature}\n`;
    }
  }

  if (requirements.userTypes && requirements.userTypes.length > 0) {
    prompt += `\n**User Types:**\n`;
    for (const userType of requirements.userTypes) {
      prompt += `- ${userType}\n`;
    }
  }

  if (requirements.integrations && requirements.integrations.length > 0) {
    prompt += `\n**Integrations to include:**\n`;
    for (const integration of requirements.integrations) {
      prompt += `- ${integration}\n`;
    }
  }

  prompt += `\nGenerate a production-ready .shep file with all necessary entities, screens, flows, rules, integrations, and events.`;

  return prompt;
}

// ============================================================================
// AI Provider Calls
// ============================================================================

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const textContent = data.content.find((c) => c.type === "text");
  
  if (!textContent) {
    throw new Error("No text content in Claude response");
  }

  return textContent.text;
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4-turbo-preview",
      max_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices in OpenAI response");
  }

  return data.choices[0].message.content;
}
