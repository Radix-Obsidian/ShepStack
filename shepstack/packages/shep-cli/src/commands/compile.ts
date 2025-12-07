/**
 * Compile command: parses .shep spec files and generates code.
 */

import { Command } from "commander";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, basename } from "node:path";
import { parseSpec, verifySpec, ShepSpec, VerificationResult, Rule, FlowStep, Field } from "@shep/core";

export const compileCommand = new Command("compile")
  .description("Compile a .shep spec file")
  .requiredOption("--input <file>", "Input .shep file")
  .option("--output <dir>", "Output directory", "./generated")
  .option("--target <target>", "Target: all, python, typescript, sql", "all")
  .option("--dry-run", "Parse and verify only, don't generate code")
  .action((options: any) => {
    try {
      console.log(`\n🐑 Shep Compiler v0.1.0\n`);

      // Read input file
      console.log(`📖 Reading ${options.input}...`);
      const source = readFileSync(options.input, "utf-8");

      // Parse the spec
      console.log(`🔍 Parsing spec...`);
      const result = parseSpec(source, options.input);

      if (!result.success || !result.spec) {
        console.error(`\n❌ Parse failed with ${result.errors.length} error(s):\n`);
        for (const error of result.errors) {
          const loc = error.location
            ? `${error.location.file || options.input}:${error.location.line}:${error.location.column}`
            : options.input;
          console.error(`  ${loc}: ${error.message}`);
          if (error.suggestion) {
            console.error(`    💡 ${error.suggestion}`);
          }
        }
        process.exit(1);
      }

      // Print summary
      const spec = result.spec;
      console.log(`\n✅ Parsed successfully!\n`);
      printSpecSummary(spec);

      // Verify the spec
      console.log(`\n🔎 Verifying spec...\n`);
      const verification = verifySpec(spec);
      printVerificationResult(verification);

      // If verification failed, exit
      if (!verification.success) {
        console.error(`\n❌ Verification failed with ${verification.errorCount} error(s).\n`);
        console.error(`Fix the errors above before generating code.\n`);
        process.exit(1);
      }

      // Dry run - stop here
      if (options.dryRun) {
        console.log(`\n🏃 Dry run complete. No code generated.\n`);
        return;
      }

      // Ensure output directory exists
      mkdirSync(options.output, { recursive: true });

      // Generate code based on target
      console.log(`\n📝 Generating code to ${options.output}/...\n`);

      if (options.target === "all" || options.target === "typescript") {
        generateTypeScript(spec, options.output);
      }

      if (options.target === "all" || options.target === "python") {
        generatePython(spec, options.output);
      }

      if (options.target === "all" || options.target === "sql") {
        generateSQL(spec, options.output);
      }

      // Generate AI client if spec uses AI
      if (hasAIPrimitives(spec)) {
        generateAIClient(spec, options.output);
      }

      console.log(`\n🎉 Done! Generated code in ${options.output}/\n`);

    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n❌ Error: ${error.message}\n`);
      } else {
        console.error("\n❌ Unknown error occurred\n");
      }
      process.exit(1);
    }
  });

/**
 * Print a summary of the parsed spec.
 */
function printSpecSummary(spec: ShepSpec): void {
  console.log(`  App: ${spec.app}`);
  console.log(`  Entities: ${spec.entities.length}`);
  for (const entity of spec.entities) {
    console.log(`    - ${entity.name} (${entity.fields.length} fields)`);
  }
  console.log(`  Screens: ${spec.screens.length}`);
  for (const screen of spec.screens) {
    console.log(`    - ${screen.name} (${screen.kind})`);
  }
  console.log(`  Flows: ${spec.flows.length}`);
  for (const flow of spec.flows) {
    console.log(`    - "${flow.name}" (${flow.steps.length} steps)`);
  }
  console.log(`  Rules: ${spec.rules.length}`);
  console.log(`  Integrations: ${spec.integrations.length}`);
  for (const integration of spec.integrations) {
    console.log(`    - ${integration.name}`);
  }
  console.log(`  Events: ${spec.events.length}`);
}

/**
 * Print verification result with issues.
 */
function printVerificationResult(result: VerificationResult): void {
  const { summary, issues, errorCount, warningCount } = result;

  // Print summary
  console.log(`  Verification Summary:`);
  console.log(`    - Entities verified: ${summary.entitiesVerified}`);
  console.log(`    - Screens verified: ${summary.screensVerified}`);
  console.log(`    - Flows verified: ${summary.flowsVerified}`);
  console.log(`    - Rules verified: ${summary.rulesVerified}`);
  console.log(`    - Integrations verified: ${summary.integrationsVerified}`);
  console.log(`    - Relationships checked: ${summary.relationshipsVerified}`);
  console.log(`    - Wiring checks: ${summary.wiringChecks}`);

  // Print issues by severity
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  if (errors.length > 0) {
    console.log(`\n  ❌ Errors (${errors.length}):`);
    for (const issue of errors) {
      const loc = issue.location
        ? `${issue.location.file || ""}:${issue.location.line}:${issue.location.column}`
        : "";
      console.log(`    [${issue.code}] ${issue.message}`);
      if (loc) console.log(`      at ${loc}`);
      if (issue.suggestion) console.log(`      💡 ${issue.suggestion}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings (${warnings.length}):`);
    for (const issue of warnings) {
      const loc = issue.location
        ? `${issue.location.file || ""}:${issue.location.line}:${issue.location.column}`
        : "";
      console.log(`    [${issue.code}] ${issue.message}`);
      if (loc) console.log(`      at ${loc}`);
      if (issue.suggestion) console.log(`      💡 ${issue.suggestion}`);
    }
  }

  if (infos.length > 0) {
    console.log(`\n  ℹ️  Info (${infos.length}):`);
    for (const issue of infos) {
      console.log(`    [${issue.code}] ${issue.message}`);
      if (issue.suggestion) console.log(`      💡 ${issue.suggestion}`);
    }
  }

  // Final status
  if (errorCount === 0) {
    console.log(`\n  ✅ Verification passed!`);
    if (warningCount > 0) {
      console.log(`     (${warningCount} warning(s) - consider addressing these)`);
    }
  }
}

/**
 * Generate TypeScript code from the spec.
 */
function generateTypeScript(spec: ShepSpec, outputDir: string): void {
  const hasAI = hasAIPrimitives(spec);
  
  // Generate interfaces for entities
  let interfaces = `// Generated by Shep Compiler
// App: ${spec.app}
// DO NOT EDIT - regenerate from .shep file

`;

  for (const entity of spec.entities) {
    interfaces += `export interface ${entity.name} {\n`;
    for (const field of entity.fields) {
      const tsType = fieldTypeToTypeScript(field.fieldType, field.relatedEntity, field.enumValues);
      const optional = field.required ? "" : "?";
      interfaces += `  ${field.name}${optional}: ${tsType};\n`;
    }
    interfaces += `}\n\n`;
  }

  // Generate enum types
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "enum" && field.enumValues) {
        interfaces += `export type ${entity.name}${capitalize(field.name)} = ${field.enumValues.map((v: string) => `"${v}"`).join(" | ")};\n\n`;
      }
    }
  }

  writeFileSync(`${outputDir}/types.ts`, interfaces);
  console.log(`  ✓ ${outputDir}/types.ts`);

  // Generate API client stub
  let apiClient = `// Generated API client for ${spec.app}
// DO NOT EDIT - regenerate from .shep file

import type { ${spec.entities.map((e: any) => e.name).join(", ")} } from "./types";

const API_BASE = process.env.API_URL || "http://localhost:3001/api";

`;

  for (const entity of spec.entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();
    apiClient += `// ${name} API
export const ${nameLower}Api = {
  getAll: async (): Promise<${name}[]> => {
    const res = await fetch(\`\${API_BASE}/${nameLower}s\`);
    return res.json();
  },
  
  getById: async (id: string): Promise<${name}> => {
    const res = await fetch(\`\${API_BASE}/${nameLower}s/\${id}\`);
    return res.json();
  },
  
  create: async (data: Omit<${name}, "id">): Promise<${name}> => {
    const res = await fetch(\`\${API_BASE}/${nameLower}s\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<${name}>): Promise<${name}> => {
    const res = await fetch(\`\${API_BASE}/${nameLower}s/\${id}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(\`\${API_BASE}/${nameLower}s/\${id}\`, { method: "DELETE" });
  },
};

`;
  }

  writeFileSync(`${outputDir}/api.ts`, apiClient);
  console.log(`  ✓ ${outputDir}/api.ts`);
  
  // Generate React hooks if AI is used
  if (hasAI) {
    generateReactHooks(spec, outputDir);
  }
}

/**
 * Generate React hooks for data fetching and AI.
 */
function generateReactHooks(spec: ShepSpec, outputDir: string): void {
  let hooks = `// Generated React Hooks for ${spec.app}
// DO NOT EDIT - regenerate from .shep file

import { useState, useEffect, useCallback } from 'react';
import type { ${spec.entities.map((e: any) => e.name).join(", ")} } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// =============================================================================
// Generic Fetch Hook
// =============================================================================

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useQuery<T>(endpoint: string): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(\`\${API_BASE}\${endpoint}\`);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// Entity Hooks
// =============================================================================

`;

  // Generate hooks for each entity
  for (const entity of spec.entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();
    hooks += `export function use${name}s() {
  return useQuery<${name}[]>("/${nameLower}s");
}

export function use${name}(id: string) {
  return useQuery<${name}>(\`/${nameLower}s/\${id}\`);
}

`;
  }

  // Generate AI hooks
  hooks += `// =============================================================================
// AI Hooks
// =============================================================================

interface UseAIResult {
  result: string | null;
  loading: boolean;
  error: Error | null;
  compute: (data: Record<string, unknown>) => Promise<string>;
}

function useAI(endpoint: string): UseAIResult {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compute = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(\`\${API_BASE}/ai/\${endpoint}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(\`AI call failed: \${res.status}\`);
      const json = await res.json();
      setResult(json.result);
      setError(null);
      return json.result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { result, loading, error, compute };
}

`;

  // Generate hooks for AI fields
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai" && field.aiPrompt) {
        const hookName = `use${entity.name}${capitalize(field.name)}`;
        hooks += `/**
 * AI Hook: Compute ${entity.name}.${field.name}
 * Prompt: "${field.aiPrompt}"
 */
export function ${hookName}() {
  return useAI("${entity.name.toLowerCase()}_${field.name}");
}

`;
      }
    }
  }

  // Generate hooks for AI rules
  const aiRules: { description: string }[] = [];
  for (const rule of spec.rules) {
    if (rule.aiCondition) {
      aiRules.push({ description: rule.description });
    }
  }

  for (let i = 0; i < aiRules.length; i++) {
    hooks += `/**
 * AI Rule Hook: ${aiRules[i].description}
 */
export function useAIRule${i + 1}() {
  return useAI("rule_${i + 1}");
}

`;
  }

  writeFileSync(`${outputDir}/hooks.ts`, hooks);
  console.log(`  ✓ ${outputDir}/hooks.ts`);
}

/**
 * Generate Python code from the spec.
 */
function generatePython(spec: ShepSpec, outputDir: string): void {
  const hasAI = hasAIPrimitives(spec);
  
  // Generate Pydantic models
  let models = `# Generated by Shep Compiler
# App: ${spec.app}
# DO NOT EDIT - regenerate from .shep file

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, computed_field
from enum import Enum
${hasAI ? 'from .ai_client import *  # AI functions for derived fields\n' : ''}
`;

  // Generate enums first
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "enum" && field.enumValues) {
        const enumName = `${entity.name}${capitalize(field.name)}`;
        models += `class ${enumName}(str, Enum):\n`;
        for (const value of field.enumValues) {
          models += `    ${value} = "${value}"\n`;
        }
        models += `\n`;
      }
    }
  }

  // Generate models
  for (const entity of spec.entities) {
    models += `class ${entity.name}(BaseModel):\n`;
    if (entity.fields.length === 0) {
      models += `    pass\n`;
    } else {
      for (const field of entity.fields) {
        const pyType = fieldTypeToPython(field.fieldType, field.relatedEntity, field.enumValues, entity.name, field.name);
        const optional = field.required ? "" : "Optional[";
        const optionalClose = field.required ? "" : "]";
        const defaultVal = field.required ? "" : " = None";
        models += `    ${field.name}: ${optional}${pyType}${optionalClose}${defaultVal}\n`;
      }
    }
    models += `\n`;
  }

  writeFileSync(`${outputDir}/models.py`, models);
  console.log(`  ✓ ${outputDir}/models.py`);

  // Generate FastAPI routes
  let routes = `# Generated by Shep Compiler
# App: ${spec.app}
# DO NOT EDIT - regenerate from .shep file

from fastapi import APIRouter, HTTPException
from typing import List
from .models import ${spec.entities.map((e: any) => e.name).join(", ")}
${hasAI ? 'from .ai_client import *  # AI functions\n' : ''}
router = APIRouter()

# In-memory storage (replace with database)
`;

  for (const entity of spec.entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();
    routes += `${nameLower}_db: dict[str, ${name}] = {}\n`;
  }

  routes += `\n`;

  for (const entity of spec.entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();
    routes += `
# ${name} routes
@router.get("/${nameLower}s", response_model=List[${name}])
async def list_${nameLower}s():
    return list(${nameLower}_db.values())

@router.get("/${nameLower}s/{id}", response_model=${name})
async def get_${nameLower}(id: str):
    if id not in ${nameLower}_db:
        raise HTTPException(status_code=404, detail="${name} not found")
    return ${nameLower}_db[id]

@router.post("/${nameLower}s", response_model=${name})
async def create_${nameLower}(data: ${name}):
    ${nameLower}_db[data.id if hasattr(data, 'id') else str(len(${nameLower}_db))] = data
    return data

@router.put("/${nameLower}s/{id}", response_model=${name})
async def update_${nameLower}(id: str, data: ${name}):
    if id not in ${nameLower}_db:
        raise HTTPException(status_code=404, detail="${name} not found")
    ${nameLower}_db[id] = data
    return data

@router.delete("/${nameLower}s/{id}")
async def delete_${nameLower}(id: str):
    if id not in ${nameLower}_db:
        raise HTTPException(status_code=404, detail="${name} not found")
    del ${nameLower}_db[id]
    return {"ok": True}
`;
  }

  // Add AI routes if spec uses AI
  if (hasAI) {
    routes += generateAIRoutes(spec);
  }

  writeFileSync(`${outputDir}/routes.py`, routes);
  console.log(`  ✓ ${outputDir}/routes.py`);
  
  // Generate main.py entry point
  generateMainPy(spec, outputDir, hasAI);
}

/**
 * Generate AI-specific FastAPI routes.
 */
function generateAIRoutes(spec: ShepSpec): string {
  let routes = `\n# =============================================================================\n# AI Routes\n# =============================================================================\n\n`;

  // Collect AI fields and generate endpoints for them
  const aiFields: { entity: string; field: string; prompt: string }[] = [];
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai" && field.aiPrompt) {
        aiFields.push({
          entity: entity.name,
          field: field.name,
          prompt: field.aiPrompt,
        });
      }
    }
  }

  // Generate routes for AI field computation
  for (const aiField of aiFields) {
    const routeName = `${aiField.entity.toLowerCase()}_${aiField.field}`;
    routes += `@router.post("/ai/${routeName}")
async def ai_${routeName}(data: dict):
    """Compute AI field: ${aiField.entity}.${aiField.field}"""
    try:
        result = await compute_${routeName}(data)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

`;
  }

  // Generate routes for AI rule conditions
  const aiRules: { description: string; input: string; prompt: string }[] = [];
  for (const rule of spec.rules) {
    if (rule.aiCondition) {
      aiRules.push({
        description: rule.description,
        input: rule.aiCondition.input,
        prompt: rule.aiCondition.prompt,
      });
    }
  }

  for (let i = 0; i < aiRules.length; i++) {
    const aiRule = aiRules[i];
    const inputVar = sanitizeIdentifier(aiRule.input);
    routes += `@router.post("/ai/rule_${i + 1}")
async def ai_rule_${i + 1}(data: dict):
    """AI rule: ${aiRule.description}"""
    try:
        ${inputVar} = data.get("${inputVar}", "")
        result = await check_rule_${i + 1}(${inputVar})
        return {"result": str(result).lower()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

`;
  }

  return routes;
}

/**
 * Generate main.py FastAPI entry point.
 */
function generateMainPy(spec: ShepSpec, outputDir: string, hasAI: boolean): void {
  const main = `# Generated by Shep Compiler
# App: ${spec.app}
# DO NOT EDIT - regenerate from .shep file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

app = FastAPI(
    title="${spec.app} API",
    description="Generated by Shep Compiler",
    version="0.1.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"app": "${spec.app}", "status": "running"${hasAI ? ', "ai": "enabled"' : ''}}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
`;

  writeFileSync(`${outputDir}/main.py`, main);
  console.log(`  ✓ ${outputDir}/main.py`);
  
  // Generate __init__.py for package
  const init = `# Generated by Shep Compiler\n# App: ${spec.app}\n`;
  writeFileSync(`${outputDir}/__init__.py`, init);
  console.log(`  ✓ ${outputDir}/__init__.py`);
  
  // Generate requirements.txt
  const requirements = `# Generated by Shep Compiler
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.5.0
${hasAI ? 'httpx>=0.25.0  # For AI API calls\nanthropic>=0.7.0  # Claude SDK (optional)\n' : ''}`;

  writeFileSync(`${outputDir}/requirements.txt`, requirements);
  console.log(`  ✓ ${outputDir}/requirements.txt`);
}

/**
 * Generate SQL schema from the spec.
 */
function generateSQL(spec: ShepSpec, outputDir: string): void {
  let sql = `-- Generated by Shep Compiler
-- App: ${spec.app}
-- DO NOT EDIT - regenerate from .shep file

`;

  for (const entity of spec.entities) {
    sql += `CREATE TABLE ${entity.name.toLowerCase()}s (\n`;
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;

    for (const field of entity.fields) {
      const sqlType = fieldTypeToSQL(field.fieldType, field.enumValues);
      const notNull = field.required ? " NOT NULL" : "";
      const unique = field.unique ? " UNIQUE" : "";
      sql += `  ${field.name} ${sqlType}${notNull}${unique},\n`;
    }

    sql += `  created_at TIMESTAMP DEFAULT NOW(),\n`;
    sql += `  updated_at TIMESTAMP DEFAULT NOW()\n`;
    sql += `);\n\n`;
  }

  writeFileSync(`${outputDir}/schema.sql`, sql);
  console.log(`  ✓ ${outputDir}/schema.sql`);
}

// Helper functions

function fieldTypeToTypeScript(type: string, relatedEntity?: string, enumValues?: string[]): string {
  switch (type) {
    case "text": return "string";
    case "number": return "number";
    case "money": return "number";
    case "email": return "string";
    case "date": return "string";
    case "datetime": return "string";
    case "boolean": return "boolean";
    case "file": return "string";
    case "image": return "string";
    case "enum": return enumValues ? enumValues.map(v => `"${v}"`).join(" | ") : "string";
    case "relationship": return relatedEntity || "unknown";
    case "list": return `${relatedEntity || "unknown"}[]`;
    case "ai": return "string"; // AI-derived fields are computed strings
    default: return "unknown";
  }
}

function fieldTypeToPython(type: string, relatedEntity?: string, enumValues?: string[], entityName?: string, fieldName?: string): string {
  switch (type) {
    case "text": return "str";
    case "number": return "float";
    case "money": return "float";
    case "email": return "str";
    case "date": return "str";
    case "datetime": return "datetime";
    case "boolean": return "bool";
    case "file": return "str";
    case "image": return "str";
    case "enum": return entityName && fieldName ? `${entityName}${capitalize(fieldName)}` : "str";
    case "relationship": return `"${relatedEntity}"` || "str";
    case "list": return `List["${relatedEntity}"]` || "List[str]";
    case "ai": return "str"; // AI-derived fields are computed strings
    default: return "str";
  }
}

function fieldTypeToSQL(type: string, enumValues?: string[]): string {
  switch (type) {
    case "text": return "VARCHAR(255)";
    case "number": return "NUMERIC";
    case "money": return "DECIMAL(10, 2)";
    case "email": return "VARCHAR(255)";
    case "date": return "DATE";
    case "datetime": return "TIMESTAMP";
    case "boolean": return "BOOLEAN";
    case "file": return "VARCHAR(512)";
    case "image": return "VARCHAR(512)";
    case "enum": return `VARCHAR(50)`;
    case "relationship": return "UUID REFERENCES";
    case "list": return "JSONB";
    default: return "VARCHAR(255)";
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sanitize a string to be a valid identifier.
 */
function sanitizeIdentifier(str: string): string {
  return str
    .replace(/["':]/g, "") // Remove quotes and colons
    .replace(/[^a-zA-Z0-9_]/g, "_") // Replace invalid chars with underscore
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Check if spec uses any AI primitives.
 */
function hasAIPrimitives(spec: ShepSpec): boolean {
  // Check for AI fields
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai") return true;
    }
  }
  // Check for AI rules
  for (const rule of spec.rules) {
    if (rule.aiCondition) return true;
  }
  // Check for AI flow steps
  for (const flow of spec.flows) {
    for (const step of flow.steps) {
      if (step.isAI) return true;
    }
  }
  return false;
}

/**
 * Generate AI client code (Python + TypeScript).
 */
function generateAIClient(spec: ShepSpec, outputDir: string): void {
  // Collect all AI prompts and usages
  const aiFields: { entity: string; field: string; prompt: string }[] = [];
  const aiRules: { description: string; input: string; prompt: string }[] = [];
  const aiFlowSteps: { flow: string; step: number; action: string }[] = [];

  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai" && field.aiPrompt) {
        aiFields.push({
          entity: entity.name,
          field: field.name,
          prompt: field.aiPrompt,
        });
      }
    }
  }

  for (const rule of spec.rules) {
    if (rule.aiCondition) {
      aiRules.push({
        description: rule.description,
        input: rule.aiCondition.input,
        prompt: rule.aiCondition.prompt,
      });
    }
  }

  for (const flow of spec.flows) {
    for (const step of flow.steps) {
      if (step.isAI && step.aiAction) {
        aiFlowSteps.push({
          flow: flow.name,
          step: step.order,
          action: step.aiAction,
        });
      }
    }
  }

  // Generate Python AI client
  let pythonAI = `# Generated AI Client for ${spec.app}
# DO NOT EDIT - regenerate from .shep file
#
# This module handles all AI primitives defined in your spec.
# It uses Claude (Anthropic) by default, but can be configured for OpenAI.

import os
import json
import hashlib
from typing import Optional, Any
from functools import lru_cache
import httpx

# Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "claude")  # "claude" or "openai"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Cache for AI responses (simple in-memory, replace with Redis in production)
_ai_cache: dict[str, Any] = {}


async def call_ai(prompt: str, context: str = "", cache_key: Optional[str] = None) -> str:
    """
    Call the AI provider with a prompt and optional context.
    Results are cached based on the cache_key.
    """
    # Check cache first
    if cache_key:
        cache_id = hashlib.md5(f"{cache_key}:{prompt}:{context}".encode()).hexdigest()
        if cache_id in _ai_cache:
            return _ai_cache[cache_id]

    if AI_PROVIDER == "claude":
        result = await _call_claude(prompt, context)
    else:
        result = await _call_openai(prompt, context)

    # Cache result
    if cache_key:
        _ai_cache[cache_id] = result

    return result


async def _call_claude(prompt: str, context: str) -> str:
    """Call Claude API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": f"{prompt}\\n\\nContext: {context}" if context else prompt,
                    }
                ],
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


async def _call_openai(prompt: str, context: str) -> str:
    """Call OpenAI API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": f"{prompt}\\n\\nContext: {context}" if context else prompt,
                    }
                ],
                "max_tokens": 1024,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# =============================================================================
# AI Field Derivation Functions
# =============================================================================

`;

  // Generate functions for each AI field
  for (const aiField of aiFields) {
    const funcName = `compute_${aiField.entity.toLowerCase()}_${aiField.field}`;
    pythonAI += `async def ${funcName}(data: dict) -> str:
    """
    AI-derived field: ${aiField.entity}.${aiField.field}
    Prompt: ${aiField.prompt}
    """
    context = json.dumps(data, default=str)
    return await call_ai(
        prompt="""${aiField.prompt}

Respond with only the result, no explanation.""",
        context=context,
        cache_key=f"${aiField.entity}_${aiField.field}_{hash(context) if context else 'empty'}"
    )

`;
  }

  // Generate functions for AI rule conditions
  pythonAI += `\n# =============================================================================\n# AI Rule Condition Functions\n# =============================================================================\n\n`;

  for (let i = 0; i < aiRules.length; i++) {
    const aiRule = aiRules[i];
    const funcName = `check_rule_${i + 1}`;
    const inputVar = sanitizeIdentifier(aiRule.input);
    pythonAI += `async def ${funcName}(${inputVar}: str) -> bool:
    """
    AI rule condition: ${aiRule.description}
    Input: ${aiRule.input}
    Prompt: ${aiRule.prompt}
    """
    result = await call_ai(
        prompt="""Analyze this text and determine if it: ${aiRule.prompt}

Text: {${inputVar}}

Respond with only "true" or "false".""",
        cache_key=f"rule_${i + 1}_{hash(${inputVar})}"
    )
    return result.strip().lower() == "true"

`;
  }

  // Generate functions for AI flow steps
  pythonAI += `\n# =============================================================================\n# AI Flow Step Functions\n# =============================================================================\n\n`;

  for (const aiStep of aiFlowSteps) {
    const flowName = sanitizeIdentifier(aiStep.flow);
    const funcName = `flow_${flowName}_step_${aiStep.step}`;
    pythonAI += `async def ${funcName}(context: dict) -> str:
    """
    AI flow step: ${aiStep.flow}, Step ${aiStep.step}
    Action: ${aiStep.action}
    """
    return await call_ai(
        prompt="""${aiStep.action}

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_${flowName}_step_${aiStep.step}"
    )

`;
  }

  writeFileSync(`${outputDir}/ai_client.py`, pythonAI);
  console.log(`  ✓ ${outputDir}/ai_client.py`);

  // Generate TypeScript AI client
  let tsAI = `// Generated AI Client for ${spec.app}
// DO NOT EDIT - regenerate from .shep file
//
// This module handles all AI primitives defined in your spec.
// It calls the Python backend which handles the actual AI calls.

const API_BASE = process.env.API_URL || "http://localhost:3001/api";

/**
 * Call an AI function on the backend.
 */
async function callAI(endpoint: string, data: Record<string, unknown>): Promise<string> {
  const response = await fetch(\`\${API_BASE}/ai/\${endpoint}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(\`AI call failed: \${response.statusText}\`);
  }
  const result = await response.json();
  return result.result;
}

// =============================================================================
// AI Field Hooks
// =============================================================================

`;

  // Generate hooks for each AI field
  for (const aiField of aiFields) {
    const hookName = `use${aiField.entity}${capitalize(aiField.field)}`;
    tsAI += `/**
 * Hook to compute AI-derived field: ${aiField.entity}.${aiField.field}
 * Prompt: ${aiField.prompt}
 */
export async function ${hookName}(data: Record<string, unknown>): Promise<string> {
  return callAI("${aiField.entity.toLowerCase()}_${aiField.field}", data);
}

`;
  }

  // Generate functions for AI rule conditions
  tsAI += `\n// =============================================================================\n// AI Rule Condition Functions\n// =============================================================================\n\n`;

  for (let i = 0; i < aiRules.length; i++) {
    const aiRule = aiRules[i];
    const funcName = `checkRule${i + 1}`;
    const inputVar = sanitizeIdentifier(aiRule.input);
    tsAI += `/**
 * AI rule condition: ${aiRule.description}
 */
export async function ${funcName}(${inputVar}: string): Promise<boolean> {
  const result = await callAI("rule_${i + 1}", { ${inputVar} });
  return result.toLowerCase() === "true";
}

`;
  }

  writeFileSync(`${outputDir}/ai.ts`, tsAI);
  console.log(`  ✓ ${outputDir}/ai.ts`);
}
