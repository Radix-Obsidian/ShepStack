/**
 * ShepLang Draft Command
 *
 * AI-assisted program generation: generates a .shep file from natural language.
 * ShepLang's key differentiator - AI writes code, humans review.
 *
 * "I want a SaaS for dog groomers" → complete .shep program
 * 
 * This embodies the ShepLang vision:
 * - AI agents are primary users (they write ShepLang)
 * - Humans review and approve
 * - ShepLang compiles to Python + TypeScript + SQL
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================================================================
// Command Definition
// ============================================================================

export const draftCommand = new Command("draft")
  .description("Generate a ShepLang program from natural language using AI")
  .argument("[description]", "Natural language description of your software product")
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
  console.log("\n🐑 ShepLang Draft v0.1.0");
  console.log("   AI → ShepLang → Python + TypeScript + SQL\n");

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
  return `You are an expert ShepLang programmer. ShepLang is an AI-native programming language for describing software products.

**ShepLang's key differentiator:** AI is a built-in verb, not an integration.

Your job is to generate a complete, valid .shep program from a natural language description.

## ShepLang Syntax Reference

\`\`\`shep
app "AppName"

# ============================================================================
# DATA - Define your data models (compiles to Python + TypeScript + SQL)
# ============================================================================

data User {
  email: email (required, unique)
  name: text (required)
  role: enum(admin, member)
  createdAt: datetime
}

data Task {
  title: text (required)
  description: text
  status: enum(todo, in_progress, done)
  priority: enum(low, medium, high)
  assignee: User                    # Relationship to another data type
  dueDate: date
  
  # AI-derived field - computed by LLM
  urgencyScore: ai("rate urgency 1-10 based on priority and due date")
}

# Field types:
#   text, number, money, email, date, datetime, boolean, file, image
#   uuid, url, phone, json, array
#   enum(value1, value2, value3)
#   EntityName (relationship)
#   list(EntityName)
#   ai("prompt") - AI-computed field

# Modifiers:
#   (required) (unique) (computed)
#   min=N max=N default=value pattern="regex"

# ============================================================================
# VIEW - Define UI components (compiles to React components)
# ============================================================================

view TaskList {
  show: [title, status, priority, assignee]
  filter: [status, priority]
  sort: dueDate asc
}

view TaskForm {
  input: [title, description, status, priority, assignee, dueDate]
  submit: CreateTask
}

view TaskDetail {
  show: [title, description, status, priority, assignee, dueDate, urgencyScore]
  actions: [complete, delete]
}

# ============================================================================
# ACTION - Define business logic (compiles to API endpoints)
# ============================================================================

action CreateTask {
  validate title is not empty
  save Task
  notify assignee
}

action CompleteTask {
  set status = done
  log "Task completed: \${title}"
}

action EscalateTask {
  # AI as a language primitive - the key differentiator
  if ai(description, "sounds urgent or blocked") {
    set priority = high
    alert manager
  }
}

# ============================================================================
# TASK - Background processes (compiles to async jobs)
# ============================================================================

task DailyDigest {
  on: schedule("0 9 * * *")  # 9am daily
  ai: summarize today's tasks
  notify all users
}

# ============================================================================
# RULE - Business constraints
# ============================================================================

rule "Only admins can delete":
  if user.role != admin → reject delete

rule "Auto-escalate frustrated customers":
  if ai(message.content, "sounds frustrated or angry") → escalate

# ============================================================================
# INTEGRATION - External services
# ============================================================================

integration Claude:
  purpose: "AI for content generation and classification"

integration Stripe:
  purpose: "Payment processing"
\`\`\`

## Guidelines

1. **Use the new syntax** - data, view, action, task (NOT entity, screen, flow)
2. **AI as a primitive** - Use ai() for fields, conditions, and task steps
3. **Include common patterns**:
   - User data type if authentication is implied
   - createdAt/updatedAt timestamps
   - Status enums for stateful entities
4. **Views for every data type** - List, Form, Detail views
5. **Actions for CRUD + business logic**
6. **Include Claude integration** if using any ai() constructs

Output ONLY the .shep file content. No markdown code blocks or explanations.`;
}

function buildUserPrompt(requirements: AppRequirements): string {
  let prompt = `Generate a complete ShepLang program (.shep file) for:\n\n`;
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
