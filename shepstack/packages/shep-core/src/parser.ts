/**
 * Shep Spec Parser
 *
 * Parses .shep specification files written by founders.
 * Uses an indentation-based syntax similar to YAML/Python.
 */

import {
  ShepSpec,
  Entity,
  Field,
  FieldType,
  Screen,
  ScreenKind,
  WizardStep,
  DashboardWidget,
  Flow,
  FlowStep,
  Rule,
  AICall,
  Integration,
  Event,
  ParseResult,
  ParseError,
  SourceLocation,
  createEmptySpec,
  successResult,
  errorResult,
} from "./spec.js";

// ============================================================================
// Main Parse Function
// ============================================================================

/**
 * Parse a .shep file into a ShepSpec AST.
 *
 * @param source The source code of the .shep file
 * @param filename Optional filename for error reporting
 * @returns ParseResult with either the spec or errors
 */
export function parseSpec(source: string, filename?: string): ParseResult {
  const parser = new SpecParser(source, filename);
  return parser.parse();
}

// ============================================================================
// Parser Implementation
// ============================================================================

interface Line {
  content: string;
  indent: number;
  lineNumber: number;
}

class SpecParser {
  private lines: Line[] = [];
  private current: number = 0;
  private errors: ParseError[] = [];
  private filename?: string;

  constructor(source: string, filename?: string) {
    this.filename = filename;
    this.lines = this.tokenizeLines(source);
  }

  /**
   * Split source into lines with indent levels.
   */
  private tokenizeLines(source: string): Line[] {
    const rawLines = source.split("\n");
    const lines: Line[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];

      // Skip empty lines and comments
      const trimmed = raw.trim();
      if (trimmed === "" || trimmed.startsWith("#")) {
        continue;
      }

      // Count leading spaces (2 spaces = 1 indent level)
      const leadingSpaces = raw.length - raw.trimStart().length;
      const indent = Math.floor(leadingSpaces / 2);

      lines.push({
        content: trimmed,
        indent,
        lineNumber: i + 1,
      });
    }

    return lines;
  }

  /**
   * Main parse entry point.
   */
  parse(): ParseResult {
    try {
      const spec = this.parseSpec();

      if (this.errors.length > 0) {
        return errorResult(this.errors);
      }

      return successResult(spec);
    } catch (e) {
      const error: ParseError = {
        message: e instanceof Error ? e.message : String(e),
        location: this.currentLocation(),
      };
      return errorResult([...this.errors, error]);
    }
  }

  /**
   * Parse the full spec.
   */
  private parseSpec(): ShepSpec {
    // First line must be "app <name>"
    if (this.lines.length === 0) {
      this.addError("Empty spec file. Must start with 'app <name>'");
      return createEmptySpec("Unknown");
    }

    const firstLine = this.lines[0];
    if (!firstLine.content.startsWith("app ")) {
      this.addError(
        `First line must be 'app <name>', got '${firstLine.content}'`,
        { line: firstLine.lineNumber, column: 1 }
      );
      return createEmptySpec("Unknown");
    }

    const appName = firstLine.content.substring(4).trim();
    this.current = 1;

    const spec = createEmptySpec(appName);

    // Parse remaining sections
    while (this.current < this.lines.length) {
      const line = this.lines[this.current];

      if (line.indent !== 0) {
        this.addError(
          `Unexpected indented line. Top-level declarations should not be indented.`,
          { line: line.lineNumber, column: 1 }
        );
        this.current++;
        continue;
      }

      if (line.content.startsWith("entity ")) {
        spec.entities.push(this.parseEntity());
      } else if (line.content.startsWith("screen ")) {
        spec.screens.push(this.parseScreen());
      } else if (line.content.startsWith("flow ")) {
        spec.flows.push(this.parseFlow());
      } else if (line.content.startsWith("rule ")) {
        spec.rules.push(this.parseRule());
      } else if (line.content.startsWith("integration ")) {
        spec.integrations.push(this.parseIntegration());
      } else if (line.content.startsWith("event ")) {
        spec.events.push(this.parseEvent());
      } else {
        this.addError(`Unknown declaration: '${line.content}'`, {
          line: line.lineNumber,
          column: 1,
        });
        this.current++;
      }
    }

    return spec;
  }

  // --------------------------------------------------------------------------
  // Entity Parsing
  // --------------------------------------------------------------------------

  private parseEntity(): Entity {
    const line = this.lines[this.current];
    const name = this.extractName(line.content, "entity ");
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const entity: Entity = {
      name,
      fields: [],
      location,
    };

    // Parse fields
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      // If we hit a line at indent 0, we're done with this entity
      if (nextLine.indent === 0) {
        break;
      }

      // Look for "fields:" section
      if (nextLine.content === "fields:" && nextLine.indent === 1) {
        this.current++;
        entity.fields = this.parseFields();
      } else {
        this.current++;
      }
    }

    return entity;
  }

  private parseFields(): Field[] {
    const fields: Field[] = [];

    while (this.current < this.lines.length) {
      const line = this.lines[this.current];

      // If indent drops to 1 or less, we're done with fields
      if (line.indent <= 1) {
        break;
      }

      // Parse field line (starts with "- ")
      if (line.content.startsWith("- ")) {
        const field = this.parseFieldLine(line.content.substring(2), line.lineNumber);
        if (field) {
          fields.push(field);
        }
      }

      this.current++;
    }

    return fields;
  }

  /**
   * Parse a field definition like:
   * "name: text, required"
   * "email: email, required, unique"
   * "plan: enum(starter, pro, enterprise)"
   * "company: Company (relationship)"
   * "sentiment: ai(\"classify as positive, neutral, negative\")"
   */
  private parseFieldLine(content: string, lineNumber: number): Field | null {
    // Split by first colon
    const colonIndex = content.indexOf(":");
    if (colonIndex === -1) {
      this.addError(`Invalid field definition: '${content}'. Expected 'name: type, modifiers'`, {
        line: lineNumber,
        column: 1,
      });
      return null;
    }

    const name = content.substring(0, colonIndex).trim();
    const rest = content.substring(colonIndex + 1).trim();

    // Parse type and modifiers, being careful with parentheses (for ai() and enum())
    const { typeSpec, modifiers } = this.parseTypeAndModifiers(rest);

    const field: Field = {
      name,
      fieldType: "text",
      required: false,
      unique: false,
      location: { line: lineNumber, column: 1, file: this.filename },
    };

    // Parse type
    if (typeSpec.startsWith("ai(") && typeSpec.endsWith(")")) {
      // AI-derived field: ai("prompt")
      field.fieldType = "ai";
      field.aiPrompt = this.extractAIPrompt(typeSpec);
    } else if (typeSpec.startsWith("enum(") && typeSpec.endsWith(")")) {
      field.fieldType = "enum";
      const values = typeSpec.substring(5, typeSpec.length - 1);
      field.enumValues = values.split(",").map((v) => v.trim());
    } else if (typeSpec.endsWith("(relationship)") || typeSpec.includes(" (relationship)")) {
      field.fieldType = "relationship";
      field.relatedEntity = typeSpec.replace("(relationship)", "").trim();
    } else if (typeSpec.startsWith("list of ")) {
      field.fieldType = "list";
      field.relatedEntity = typeSpec.substring(8).trim();
    } else {
      field.fieldType = this.parseFieldType(typeSpec);
    }

    // Parse modifiers
    for (const mod of modifiers) {
      if (mod === "required") {
        field.required = true;
      } else if (mod === "unique") {
        field.unique = true;
      } else if (mod.startsWith("min=")) {
        field.min = parseInt(mod.substring(4), 10);
      } else if (mod.startsWith("max=")) {
        field.max = parseInt(mod.substring(4), 10);
      }
    }

    return field;
  }

  /**
   * Parse type and modifiers from a field definition, handling parentheses.
   * E.g., "ai(\"classify as positive, neutral\")" or "enum(a, b, c), required"
   */
  private parseTypeAndModifiers(rest: string): { typeSpec: string; modifiers: string[] } {
    // Find the first comma that's not inside parentheses
    let parenDepth = 0;
    let firstSplitIndex = -1;

    for (let i = 0; i < rest.length; i++) {
      const char = rest[i];
      if (char === '(' || char === '[') {
        parenDepth++;
      } else if (char === ')' || char === ']') {
        parenDepth--;
      } else if (char === ',' && parenDepth === 0) {
        firstSplitIndex = i;
        break;
      }
    }

    if (firstSplitIndex === -1) {
      // No comma outside parentheses - entire string is the type
      return { typeSpec: rest.trim(), modifiers: [] };
    }

    const typeSpec = rest.substring(0, firstSplitIndex).trim();
    const modifierStr = rest.substring(firstSplitIndex + 1).trim();

    // Split remaining modifiers by comma (these should be simple)
    const modifiers = modifierStr.split(',').map(m => m.trim()).filter(m => m.length > 0);

    return { typeSpec, modifiers };
  }

  /**
   * Extract the prompt from an ai(\"...\") expression.
   */
  private extractAIPrompt(aiExpr: string): string {
    // ai("prompt") or ai('prompt')
    const match = aiExpr.match(/^ai\(["'](.+)["']\)$/);
    if (match) {
      return match[1];
    }
    // Fallback: remove ai( and )
    return aiExpr.substring(3, aiExpr.length - 1).replace(/^["']|["']$/g, "");
  }

  private parseFieldType(type: string): FieldType {
    const validTypes: FieldType[] = [
      "text",
      "number",
      "money",
      "email",
      "date",
      "datetime",
      "boolean",
      "file",
      "image",
      "ai",
    ];

    if (validTypes.includes(type as FieldType)) {
      return type as FieldType;
    }

    // Default to text
    return "text";
  }

  // --------------------------------------------------------------------------
  // Screen Parsing
  // --------------------------------------------------------------------------

  private parseScreen(): Screen {
    const line = this.lines[this.current];
    const name = this.extractName(line.content, "screen ");
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const screen: Screen = {
      name,
      kind: "form",
      location,
    };

    // Parse screen properties
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      if (nextLine.indent === 0) {
        break;
      }

      const prop = nextLine.content;

      if (prop.startsWith("kind:")) {
        screen.kind = prop.substring(5).trim() as ScreenKind;
      } else if (prop.startsWith("entity:")) {
        screen.entity = prop.substring(7).trim();
      } else if (prop.startsWith("fields:")) {
        screen.fields = this.parseInlineList(prop.substring(7).trim());
      } else if (prop.startsWith("filters:")) {
        screen.filters = this.parseInlineList(prop.substring(8).trim());
      } else if (prop.startsWith("actions:")) {
        screen.actions = this.parseInlineList(prop.substring(8).trim());
      } else if (prop.startsWith("action:")) {
        screen.actionText = this.parseQuotedString(prop.substring(7).trim());
      } else if (prop.startsWith("widgets:")) {
        this.current++;
        screen.widgets = this.parseWidgets();
        continue;
      } else if (prop.startsWith("steps:")) {
        this.current++;
        screen.steps = this.parseWizardSteps();
        continue;
      }

      this.current++;
    }

    return screen;
  }

  private parseWidgets(): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];

    while (this.current < this.lines.length) {
      const line = this.lines[this.current];

      if (line.indent <= 1) {
        break;
      }

      if (line.content.startsWith("- ")) {
        const widgetSpec = line.content.substring(2).trim();
        // Parse "Label" (type)
        const match = widgetSpec.match(/"([^"]+)"\s*\((\w+)\)/);
        if (match) {
          widgets.push({
            label: match[1],
            widgetType: match[2] as DashboardWidget["widgetType"],
            location: { line: line.lineNumber, column: 1, file: this.filename },
          });
        }
      }

      this.current++;
    }

    return widgets;
  }

  private parseWizardSteps(): WizardStep[] {
    const steps: WizardStep[] = [];

    while (this.current < this.lines.length) {
      const line = this.lines[this.current];

      if (line.indent <= 1) {
        break;
      }

      if (line.content.startsWith("- ")) {
        const stepSpec = line.content.substring(2).trim();
        // Parse "Step Name" → [field1, field2]
        const match = stepSpec.match(/"([^"]+)"\s*→\s*\[([^\]]+)\]/);
        if (match) {
          steps.push({
            name: match[1],
            fields: match[2].split(",").map((f) => f.trim()),
            location: { line: line.lineNumber, column: 1, file: this.filename },
          });
        }
      }

      this.current++;
    }

    return steps;
  }

  // --------------------------------------------------------------------------
  // Flow Parsing
  // --------------------------------------------------------------------------

  private parseFlow(): Flow {
    const line = this.lines[this.current];
    const name = this.parseQuotedString(line.content.substring(5).trim());
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const flow: Flow = {
      name,
      steps: [],
      location,
    };

    // Parse flow steps
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      if (nextLine.indent === 0) {
        break;
      }

      // Parse numbered steps: "1. User fills form" or "2. ai: categorize the ticket"
      const match = nextLine.content.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        const stepDescription = match[2];
        const isAIStep = stepDescription.toLowerCase().startsWith("ai:") ||
                         stepDescription.toLowerCase().startsWith("ai ");

        const step: FlowStep = {
          order: parseInt(match[1], 10),
          description: stepDescription,
          location: { line: nextLine.lineNumber, column: 1, file: this.filename },
        };

        if (isAIStep) {
          step.isAI = true;
          // Extract the AI action (everything after "ai:" or "ai ")
          step.aiAction = stepDescription.replace(/^ai[:\s]+/i, "").trim();
        }

        flow.steps.push(step);
      }

      this.current++;
    }

    return flow;
  }

  // --------------------------------------------------------------------------
  // Rule Parsing
  // --------------------------------------------------------------------------

  private parseRule(): Rule {
    const line = this.lines[this.current];
    const description = this.parseQuotedString(line.content.substring(5).trim());
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const rule: Rule = {
      description,
      location,
    };

    // Parse rule properties
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      if (nextLine.indent === 0) {
        break;
      }

      // Parse "if condition → action"
      if (nextLine.content.startsWith("if ") && nextLine.content.includes("→")) {
        const parts = nextLine.content.substring(3).split("→");
        const conditionPart = parts[0].trim();
        rule.action = parts[1].trim();

        // Check if condition uses ai()
        if (conditionPart.includes("ai(")) {
          rule.aiCondition = this.parseAICall(conditionPart, nextLine.lineNumber);
          rule.condition = conditionPart; // Keep original for display
        } else {
          rule.condition = conditionPart;
        }
      }

      this.current++;
    }

    return rule;
  }

  /**
   * Parse an ai() call expression.
   * Formats:
   *   ai(field, "prompt") - analyze a field
   *   ai(field.subfield, "prompt") - analyze a nested field
   */
  private parseAICall(expr: string, lineNumber: number): AICall {
    // Match: ai(input, "prompt") or ai(input, 'prompt')
    const match = expr.match(/ai\(([^,]+),\s*["']([^"']+)["']\)/);

    if (match) {
      return {
        input: match[1].trim(),
        prompt: match[2],
        outputType: "boolean", // Default for conditions
        location: { line: lineNumber, column: 1, file: this.filename },
      };
    }

    // Fallback: try to extract what we can
    const fallbackMatch = expr.match(/ai\((.+)\)/);
    if (fallbackMatch) {
      const inner = fallbackMatch[1];
      const commaParts = inner.split(",").map(p => p.trim());
      return {
        input: commaParts[0] || "input",
        prompt: commaParts[1]?.replace(/^["']|["']$/g, "") || "analyze",
        outputType: "boolean",
        location: { line: lineNumber, column: 1, file: this.filename },
      };
    }

    // Last resort
    return {
      input: "input",
      prompt: expr,
      outputType: "boolean",
      location: { line: lineNumber, column: 1, file: this.filename },
    };
  }

  // --------------------------------------------------------------------------
  // Integration Parsing
  // --------------------------------------------------------------------------

  private parseIntegration(): Integration {
    const line = this.lines[this.current];
    const name = this.extractName(line.content, "integration ");
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const integration: Integration = {
      name,
      location,
    };

    // Parse integration properties
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      if (nextLine.indent === 0) {
        break;
      }

      const prop = nextLine.content;

      if (prop.startsWith("endpoint:")) {
        integration.endpoint = this.parseQuotedString(prop.substring(9).trim());
      } else if (prop.startsWith("purpose:")) {
        integration.purpose = this.parseQuotedString(prop.substring(8).trim());
      }

      this.current++;
    }

    return integration;
  }

  // --------------------------------------------------------------------------
  // Event Parsing
  // --------------------------------------------------------------------------

  private parseEvent(): Event {
    const line = this.lines[this.current];
    const name = this.parseQuotedString(line.content.substring(6).trim());
    const location = { line: line.lineNumber, column: 1, file: this.filename };

    this.current++;

    const event: Event = {
      name,
      fields: [],
      location,
    };

    // Parse event properties
    while (this.current < this.lines.length) {
      const nextLine = this.lines[this.current];

      if (nextLine.indent === 0) {
        break;
      }

      if (nextLine.content.startsWith("fields:")) {
        event.fields = this.parseInlineList(nextLine.content.substring(7).trim());
      }

      this.current++;
    }

    return event;
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private extractName(content: string, prefix: string): string {
    let name = content.substring(prefix.length).trim();
    // Remove trailing colon if present
    if (name.endsWith(":")) {
      name = name.substring(0, name.length - 1);
    }
    return name;
  }

  private parseQuotedString(str: string): string {
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.substring(1, str.length - 1);
    }
    return str;
  }

  private parseInlineList(str: string): string[] {
    // Parse [item1, item2, item3]
    if (str.startsWith("[") && str.endsWith("]")) {
      const inner = str.substring(1, str.length - 1);
      return inner.split(",").map((s) => s.trim());
    }
    return [];
  }

  private addError(message: string, location?: SourceLocation) {
    this.errors.push({
      message,
      location: location || this.currentLocation(),
    });
  }

  private currentLocation(): SourceLocation {
    if (this.current < this.lines.length) {
      return {
        line: this.lines[this.current].lineNumber,
        column: 1,
        file: this.filename,
      };
    }
    return { line: 1, column: 1, file: this.filename };
  }
}
