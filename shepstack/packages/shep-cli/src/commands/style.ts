/**
 * Shep Style Command
 * 
 * Analyzes existing generated code to learn patterns and generates an AGENTS.md
 * file that guides future code generation. Inspired by Evil Martians' "vibe coding"
 * approach - making AI-generated code look like it was written by a world-class engineer.
 * 
 * Usage:
 *   shep style --analyze <dir>     # Analyze existing code and generate style.md
 *   shep style --apply <agents.md> # Apply AGENTS.md to future codegen
 *   shep style --init              # Create default AGENTS.md template
 */

import { Command } from "commander";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

// =============================================================================
// Style Patterns - What we look for in code
// =============================================================================

interface StylePattern {
  name: string;
  description: string;
  examples: string[];
  antipatterns: string[];
}

interface AnalysisResult {
  pythonPatterns: StylePattern[];
  typescriptPatterns: StylePattern[];
  namingConventions: string[];
  structurePatterns: string[];
  aiPatterns: string[];
  domainTerms: Set<string>;
}

// =============================================================================
// Code Analysis
// =============================================================================

function analyzeFile(filePath: string, content: string): Partial<AnalysisResult> {
  const ext = extname(filePath);
  const result: Partial<AnalysisResult> = {
    namingConventions: [],
    structurePatterns: [],
    aiPatterns: [],
    domainTerms: new Set(),
  };

  // Extract class/function/variable names as domain terms
  const classMatches = content.match(/class\s+([A-Z][a-zA-Z0-9]*)/g) || [];
  const funcMatches = content.match(/(?:def|function|async function)\s+([a-z_][a-zA-Z0-9_]*)/g) || [];
  
  classMatches.forEach(m => {
    const name = m.replace(/class\s+/, '');
    result.domainTerms?.add(name);
  });

  // Detect AI-related patterns
  if (content.includes('call_ai') || content.includes('useAI') || content.includes('ai_client')) {
    result.aiPatterns?.push('Uses centralized AI client pattern');
  }
  if (content.includes('async def') || content.includes('async function')) {
    result.aiPatterns?.push('Uses async/await for AI calls');
  }
  if (content.includes('cache') || content.includes('_ai_cache')) {
    result.aiPatterns?.push('Implements AI response caching');
  }

  // Detect structure patterns
  if (ext === '.py') {
    if (content.includes('class') && content.includes('BaseModel')) {
      result.structurePatterns?.push('Uses Pydantic BaseModel for data classes');
    }
    if (content.includes('@router')) {
      result.structurePatterns?.push('Uses FastAPI router decorators');
    }
    if (content.includes('from enum import Enum')) {
      result.structurePatterns?.push('Uses Python Enum for state');
    }
    if (content.includes('Optional[')) {
      result.structurePatterns?.push('Uses Optional for nullable fields');
    }
  }

  if (ext === '.ts' || ext === '.tsx') {
    if (content.includes('useState') || content.includes('useEffect')) {
      result.structurePatterns?.push('Uses React hooks');
    }
    if (content.includes('interface ') || content.includes('type ')) {
      result.structurePatterns?.push('Uses TypeScript interfaces/types');
    }
    if (content.includes('export function use')) {
      result.structurePatterns?.push('Uses custom hooks pattern (useXxx)');
    }
  }

  // Detect naming conventions
  const snakeCaseVars = content.match(/[a-z]+_[a-z]+/g) || [];
  const camelCaseVars = content.match(/[a-z]+[A-Z][a-z]+/g) || [];
  
  if (snakeCaseVars.length > camelCaseVars.length && ext === '.py') {
    result.namingConventions?.push('snake_case for Python variables/functions');
  }
  if (camelCaseVars.length > 0 && (ext === '.ts' || ext === '.tsx')) {
    result.namingConventions?.push('camelCase for TypeScript variables/functions');
  }

  return result;
}

function analyzeDirectory(dir: string): AnalysisResult {
  const result: AnalysisResult = {
    pythonPatterns: [],
    typescriptPatterns: [],
    namingConventions: [],
    structurePatterns: [],
    aiPatterns: [],
    domainTerms: new Set(),
  };

  const supportedExtensions = ['.py', '.ts', '.tsx', '.js', '.jsx'];

  function walkDir(currentDir: string): void {
    const files = readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = join(currentDir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'venv' && file !== '__pycache__') {
        walkDir(filePath);
      } else if (stat.isFile() && supportedExtensions.includes(extname(file))) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          const fileResult = analyzeFile(filePath, content);
          
          // Merge results
          if (fileResult.namingConventions) {
            result.namingConventions.push(...fileResult.namingConventions);
          }
          if (fileResult.structurePatterns) {
            result.structurePatterns.push(...fileResult.structurePatterns);
          }
          if (fileResult.aiPatterns) {
            result.aiPatterns.push(...fileResult.aiPatterns);
          }
          if (fileResult.domainTerms) {
            fileResult.domainTerms.forEach(term => result.domainTerms.add(term));
          }
        } catch (e) {
          // Skip files we can't read
        }
      }
    }
  }

  walkDir(dir);

  // Deduplicate arrays
  result.namingConventions = [...new Set(result.namingConventions)];
  result.structurePatterns = [...new Set(result.structurePatterns)];
  result.aiPatterns = [...new Set(result.aiPatterns)];

  return result;
}

// =============================================================================
// AGENTS.md Generation
// =============================================================================

function generateAgentsMd(analysis: AnalysisResult, appName: string): string {
  const domainTermsList = [...analysis.domainTerms].slice(0, 20);
  
  return `# AGENTS.md - Shep Style Guide
# Generated by \`shep style\` command
# Based on Evil Martians' vibe coding methodology

## Project Context

This is the **${appName}** application, built with the Shep language.

Shep generates:
- **Python** (FastAPI, Pydantic) for the backend
- **TypeScript** (React, Next.js) for the frontend
- **SQL** (PostgreSQL) for the database

## Core Principles

Follow the Golden Sheep AI Methodology:
1. **Vertical Slice Delivery** - Build complete features end-to-end
2. **Full-Stack Reality Testing** - Test everything the way users experience it
3. **Integration-First Verification** - If it compiles, it works
4. **AI as First-Class Citizen** - AI is a verb, not an integration

## Domain Language

Use domain-specific terms, not generic technical names:

${domainTermsList.length > 0 ? domainTermsList.map(t => `- \`${t}\``).join('\n') : '- Define your domain terms here'}

**Bad:** \`User\`, \`Data\`, \`Item\`, \`Thing\`
**Good:** Use terms from your business domain (e.g., \`Founder\`, \`Investor\`, \`Ticket\`, \`Escalation\`)

## Naming Conventions

### Python
${analysis.namingConventions.filter(n => n.includes('Python')).map(n => `- ${n}`).join('\n') || '- snake_case for variables and functions\n- PascalCase for classes'}

### TypeScript
${analysis.namingConventions.filter(n => n.includes('TypeScript')).map(n => `- ${n}`).join('\n') || '- camelCase for variables and functions\n- PascalCase for components and interfaces'}

## Structure Patterns

${analysis.structurePatterns.length > 0 
  ? analysis.structurePatterns.map(p => `### ${p.replace(/Uses? /i, '')}\n\`\`\`\n// Pattern detected - add example here\n\`\`\`\n`).join('\n')
  : `### Pydantic BaseModel for data classes
\`\`\`python
class Message(BaseModel):
    id: str
    content: str
    sentiment: SentimentScore  # Use enums, not raw strings
\`\`\`

### React Custom Hooks
\`\`\`typescript
export function useMessages() {
  return useQuery<Message[]>("/messages");
}
\`\`\`
`}

## AI Patterns

${analysis.aiPatterns.length > 0 
  ? analysis.aiPatterns.map(p => `- ${p}`).join('\n')
  : `- Use centralized AI client (ai_client.py, ai.ts)
- Always use async/await for AI calls
- Implement response caching with hash-based keys
- Return typed responses, not raw strings`}

### AI Field Pattern
\`\`\`shep
entity Message:
  fields:
    - sentiment: ai("classify as positive, neutral, or negative")
\`\`\`

Generates:
\`\`\`python
async def compute_message_sentiment(data: dict) -> str:
    return await call_ai(
        prompt="Classify the following text as positive, neutral, or negative",
        context=data.get("content", ""),
        cache_key="message_sentiment"
    )
\`\`\`

### AI Rule Pattern
\`\`\`shep
rule "Auto-escalate frustrated customers":
  if ai(message.content, "sounds frustrated") → escalate
\`\`\`

Generates a boolean-returning AI function that can be called from routes.

## Anti-Patterns (Avoid)

- ❌ Fat models with business logic
- ❌ Generic names like \`User\`, \`Data\`, \`Handler\`
- ❌ Mocked AI responses in production code
- ❌ Hardcoded API keys
- ❌ Synchronous AI calls (always use async)
- ❌ String types for states (use enums)
- ❌ Inline styles in React (use component patterns)

## File Organization

\`\`\`
generated/
├── models.py          # Pydantic models (data layer)
├── routes.py          # FastAPI routes (API layer)
├── ai_client.py       # AI integration (Claude/OpenAI)
├── main.py            # FastAPI entry point
├── types.ts           # TypeScript interfaces
├── api.ts             # API client
├── hooks.ts           # React hooks
├── ai.ts              # Frontend AI client
└── schema.sql         # PostgreSQL schema
\`\`\`

## Error Handling

### Python
\`\`\`python
@router.post("/ai/{endpoint}")
async def ai_endpoint(data: dict):
    try:
        result = await call_ai(...)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
\`\`\`

### TypeScript
\`\`\`typescript
const { data, loading, error } = useQuery<T>(endpoint);
if (error) return <ErrorState message={error.message} />;
if (loading) return <LoadingState />;
\`\`\`

## Testing Requirements

Every feature must pass:
1. ✅ Unit tests for business logic
2. ✅ Integration tests for API endpoints
3. ✅ AI response validation (schema checks)
4. ✅ E2E tests for user flows
5. ✅ Deployment verification

---

*Generated by Shep Compiler - Golden Sheep AI Methodology*
*"Build narrow. Test deep. Ship confidently."*
`;
}

// =============================================================================
// Default Template
// =============================================================================

function getDefaultTemplate(): string {
  return generateAgentsMd({
    pythonPatterns: [],
    typescriptPatterns: [],
    namingConventions: ['snake_case for Python variables/functions', 'camelCase for TypeScript variables/functions'],
    structurePatterns: ['Uses Pydantic BaseModel for data classes', 'Uses React hooks'],
    aiPatterns: ['Uses centralized AI client pattern', 'Uses async/await for AI calls'],
    domainTerms: new Set(['Company', 'User', 'Message', 'Conversation']),
  }, 'MyApp');
}

// =============================================================================
// Command Definition
// =============================================================================

export const styleCommand = new Command("style")
  .description("Analyze code patterns and generate AGENTS.md for future codegen")
  .option("--analyze <dir>", "Directory to analyze for patterns")
  .option("--init", "Create default AGENTS.md template")
  .option("--output <file>", "Output file path", "./AGENTS.md")
  .option("--app <name>", "Application name", "MyApp")
  .action(async (options: { analyze?: string; init?: boolean; output: string; app: string }) => {
    console.log("🐑 Shep Style v0.1.0\n");

    if (options.init) {
      // Create default template
      console.log("📝 Creating default AGENTS.md template...\n");
      const template = getDefaultTemplate();
      writeFileSync(options.output, template);
      console.log(`  ✓ Created ${options.output}`);
      console.log("\n📖 Edit this file to match your project's style.");
      console.log("   Then use it with: shep compile --style AGENTS.md");
      return;
    }

    if (options.analyze) {
      // Analyze existing code
      const dir = options.analyze;
      
      if (!existsSync(dir)) {
        console.error(`❌ Directory not found: ${dir}`);
        process.exit(1);
      }

      console.log(`🔍 Analyzing code in ${dir}...\n`);
      
      const analysis = analyzeDirectory(dir);
      
      console.log("  Patterns detected:");
      console.log(`    - Domain terms: ${analysis.domainTerms.size}`);
      console.log(`    - Naming conventions: ${analysis.namingConventions.length}`);
      console.log(`    - Structure patterns: ${analysis.structurePatterns.length}`);
      console.log(`    - AI patterns: ${analysis.aiPatterns.length}`);
      
      console.log("\n📝 Generating AGENTS.md...\n");
      
      const agentsMd = generateAgentsMd(analysis, options.app);
      writeFileSync(options.output, agentsMd);
      
      console.log(`  ✓ Created ${options.output}`);
      console.log("\n✨ Style guide generated!");
      console.log("\n   Next steps:");
      console.log("   1. Review and customize AGENTS.md");
      console.log("   2. Add to your .shep project");
      console.log("   3. Use with: shep compile --style AGENTS.md");
      return;
    }

    // No options provided - show help
    console.log("Usage:");
    console.log("  shep style --init              Create default AGENTS.md template");
    console.log("  shep style --analyze <dir>     Analyze code and generate style guide");
    console.log("");
    console.log("Options:");
    console.log("  --output <file>  Output file path (default: ./AGENTS.md)");
    console.log("  --app <name>     Application name (default: MyApp)");
    console.log("");
    console.log("Example:");
    console.log("  shep style --analyze ./generated --app SupportAI --output AGENTS.md");
  });
