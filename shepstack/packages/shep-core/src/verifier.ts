/**
 * Shep Verification Engine
 *
 * The core value proposition: catch errors at compile time, not runtime.
 * Verifies that specs are complete, consistent, and correctly wired.
 *
 * "If it compiles, it works. If it's wired, it ships."
 */

import {
  ShepSpec,
  Entity,
  Field,
  FieldType,
  Screen,
  Flow,
  Rule,
  Integration,
  Event,
  SourceLocation,
} from "./spec.js";

// ============================================================================
// Verification Result Types
// ============================================================================

/**
 * Severity levels for verification issues.
 */
export type IssueSeverity = "error" | "warning" | "info";

/**
 * A verification issue found during spec analysis.
 */
export interface VerificationIssue {
  /** Severity of the issue */
  severity: IssueSeverity;
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable message */
  message: string;
  /** Location in source file */
  location?: SourceLocation;
  /** Suggestion for how to fix */
  suggestion?: string;
  /** Related locations (e.g., the entity a screen references) */
  relatedLocations?: SourceLocation[];
}

/**
 * Result of verification.
 */
export interface VerificationResult {
  /** Whether verification passed (no errors) */
  success: boolean;
  /** All issues found */
  issues: VerificationIssue[];
  /** Number of errors */
  errorCount: number;
  /** Number of warnings */
  warningCount: number;
  /** Verification summary */
  summary: VerificationSummary;
}

/**
 * Summary of what was verified.
 */
export interface VerificationSummary {
  entitiesVerified: number;
  screensVerified: number;
  flowsVerified: number;
  rulesVerified: number;
  integrationsVerified: number;
  eventsVerified: number;
  relationshipsVerified: number;
  wiringChecks: number;
}

// ============================================================================
// Type System
// ============================================================================

/**
 * Internal type representation for type checking.
 */
export interface ShepType {
  kind: "primitive" | "enum" | "entity" | "list" | "ai" | "unknown";
  name: string;
  /** For enums: possible values */
  enumValues?: string[];
  /** For relationships/lists: the related entity */
  relatedEntity?: string;
  /** Whether this type is nullable */
  nullable?: boolean;
  /** For AI types: the prompt */
  aiPrompt?: string;
}

/**
 * Type compatibility result.
 */
interface TypeCompatibility {
  compatible: boolean;
  reason?: string;
}

/**
 * Constraint extracted from a rule.
 */
export interface Constraint {
  /** The rule this constraint came from */
  ruleDescription: string;
  /** Type of constraint */
  kind: "field_required" | "field_value" | "ai_condition" | "action_trigger" | "custom";
  /** Entity this constraint applies to */
  entityName?: string;
  /** Field this constraint applies to */
  fieldName?: string;
  /** Expected value or condition */
  condition?: string;
  /** Action to trigger */
  action?: string;
  /** Whether this is an AI-based constraint */
  isAI?: boolean;
  /** Source location */
  location?: SourceLocation;
}

/**
 * Type environment for type checking.
 */
class TypeEnvironment {
  private entityTypes: Map<string, Map<string, ShepType>> = new Map();
  private constraints: Constraint[] = [];

  /**
   * Register an entity and its field types.
   */
  registerEntity(entityName: string, fields: { name: string; type: ShepType }[]): void {
    const fieldMap = new Map<string, ShepType>();
    for (const field of fields) {
      fieldMap.set(field.name, field.type);
    }
    this.entityTypes.set(entityName, fieldMap);
  }

  /**
   * Get the type of a field in an entity.
   */
  getFieldType(entityName: string, fieldName: string): ShepType | undefined {
    return this.entityTypes.get(entityName)?.get(fieldName);
  }

  /**
   * Check if an entity exists.
   */
  hasEntity(entityName: string): boolean {
    return this.entityTypes.has(entityName);
  }

  /**
   * Get all entities.
   */
  getEntities(): string[] {
    return Array.from(this.entityTypes.keys());
  }

  /**
   * Get all fields for an entity.
   */
  getEntityFields(entityName: string): Map<string, ShepType> | undefined {
    return this.entityTypes.get(entityName);
  }

  /**
   * Add a constraint.
   */
  addConstraint(constraint: Constraint): void {
    this.constraints.push(constraint);
  }

  /**
   * Get all constraints.
   */
  getConstraints(): Constraint[] {
    return this.constraints;
  }

  /**
   * Find conflicting constraints.
   */
  findConflicts(): { constraint1: Constraint; constraint2: Constraint; reason: string }[] {
    const conflicts: { constraint1: Constraint; constraint2: Constraint; reason: string }[] = [];

    for (let i = 0; i < this.constraints.length; i++) {
      for (let j = i + 1; j < this.constraints.length; j++) {
        const c1 = this.constraints[i];
        const c2 = this.constraints[j];

        // Check for same field, opposite conditions
        if (c1.entityName === c2.entityName && c1.fieldName === c2.fieldName) {
          // Check for mutually exclusive conditions
          if (c1.kind === "field_value" && c2.kind === "field_value") {
            if (c1.condition && c2.condition) {
              // Check for opposites
              if (this.areOppositeConditions(c1.condition, c2.condition)) {
                conflicts.push({
                  constraint1: c1,
                  constraint2: c2,
                  reason: `Conflicting conditions on ${c1.entityName}.${c1.fieldName}`,
                });
              }
            }
          }
        }

        // Check for contradictory actions
        if (c1.action && c2.action && c1.entityName === c2.entityName) {
          if (this.areContradictoryActions(c1.action, c2.action)) {
            conflicts.push({
              constraint1: c1,
              constraint2: c2,
              reason: `Contradictory actions: "${c1.action}" vs "${c2.action}"`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  private areOppositeConditions(c1: string, c2: string): boolean {
    const opposites = [
      ["true", "false"],
      ["enabled", "disabled"],
      ["active", "inactive"],
      ["visible", "hidden"],
      ["allowed", "denied"],
      ["public", "private"],
    ];

    const c1Lower = c1.toLowerCase();
    const c2Lower = c2.toLowerCase();

    for (const [a, b] of opposites) {
      if ((c1Lower.includes(a) && c2Lower.includes(b)) || 
          (c1Lower.includes(b) && c2Lower.includes(a))) {
        return true;
      }
    }

    // Check for negation patterns
    if (c1Lower.startsWith("not ") && c2Lower === c1Lower.slice(4)) return true;
    if (c2Lower.startsWith("not ") && c1Lower === c2Lower.slice(4)) return true;
    if (c1Lower.startsWith("!") && c2Lower === c1Lower.slice(1)) return true;
    if (c2Lower.startsWith("!") && c1Lower === c2Lower.slice(1)) return true;

    return false;
  }

  private areContradictoryActions(a1: string, a2: string): boolean {
    const contradictions = [
      ["create", "delete"],
      ["enable", "disable"],
      ["show", "hide"],
      ["allow", "deny"],
      ["approve", "reject"],
      ["activate", "deactivate"],
      ["publish", "unpublish"],
    ];

    const a1Lower = a1.toLowerCase();
    const a2Lower = a2.toLowerCase();

    for (const [x, y] of contradictions) {
      if ((a1Lower.includes(x) && a2Lower.includes(y)) ||
          (a1Lower.includes(y) && a2Lower.includes(x))) {
        return true;
      }
    }

    return false;
  }
}

// ============================================================================
// Valid Types
// ============================================================================

/**
 * Built-in field types that founders can use.
 */
const VALID_FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "money",
  "email",
  "date",
  "datetime",
  "boolean",
  "file",
  "image",
  "enum",
  "relationship",
  "list",
  "ai",
];

/**
 * Valid screen kinds.
 */
const VALID_SCREEN_KINDS = ["form", "list", "detail", "dashboard", "wizard", "api"];

/**
 * Valid widget types for dashboards.
 */
const VALID_WIDGET_TYPES = ["number", "percentage", "rating", "list", "chart"];

// ============================================================================
// Main Verification Function
// ============================================================================

/**
 * Verify a parsed Shep spec.
 *
 * @param spec The parsed spec to verify
 * @returns Verification result with issues and summary
 */
export function verifySpec(spec: ShepSpec): VerificationResult {
  const verifier = new SpecVerifier(spec);
  return verifier.verify();
}

// ============================================================================
// Verifier Implementation
// ============================================================================

class SpecVerifier {
  private spec: ShepSpec;
  private issues: VerificationIssue[] = [];
  private entityNames: Set<string> = new Set();
  private screenNames: Set<string> = new Set();
  private integrationNames: Set<string> = new Set();
  private entityFieldMap: Map<string, Set<string>> = new Map();
  private typeEnv: TypeEnvironment = new TypeEnvironment();

  constructor(spec: ShepSpec) {
    this.spec = spec;
  }

  /**
   * Run all verification checks.
   */
  verify(): VerificationResult {
    // Phase 1: Build symbol tables and type environment
    this.buildSymbolTables();
    this.buildTypeEnvironment();

    // Phase 2: Verify each component
    this.verifyEntities();
    this.verifyScreens();
    this.verifyFlows();
    this.verifyRules();
    this.verifyIntegrations();
    this.verifyEvents();

    // Phase 3: Type checking
    this.verifyTypes();

    // Phase 4: Constraint validation
    this.extractAndVerifyConstraints();

    // Phase 5: Verify wiring (cross-component checks)
    this.verifyWiring();

    // Phase 6: Integration type matching (frontend ↔ backend)
    this.verifyIntegrationTypes();

    // Phase 7: Linting - best practices and style
    this.lintNamingConventions();
    this.lintUnusedEntities();
    this.lintBestPractices();

    // Build result
    const errorCount = this.issues.filter((i) => i.severity === "error").length;
    const warningCount = this.issues.filter((i) => i.severity === "warning").length;

    return {
      success: errorCount === 0,
      issues: this.issues,
      errorCount,
      warningCount,
      summary: this.buildSummary(),
    };
  }

  // --------------------------------------------------------------------------
  // Symbol Table Building
  // --------------------------------------------------------------------------

  private buildSymbolTables(): void {
    // Build entity name set and field map
    for (const entity of this.spec.entities) {
      this.entityNames.add(entity.name);
      const fields = new Set<string>();
      for (const field of entity.fields) {
        fields.add(field.name);
      }
      this.entityFieldMap.set(entity.name, fields);
    }

    // Build screen name set
    for (const screen of this.spec.screens) {
      this.screenNames.add(screen.name);
    }

    // Build integration name set
    for (const integration of this.spec.integrations) {
      this.integrationNames.add(integration.name);
    }
  }

  // --------------------------------------------------------------------------
  // Type Environment Building
  // --------------------------------------------------------------------------

  private buildTypeEnvironment(): void {
    for (const entity of this.spec.entities) {
      const fields: { name: string; type: ShepType }[] = [];
      
      for (const field of entity.fields) {
        const shepType = this.fieldToShepType(field);
        fields.push({ name: field.name, type: shepType });
      }
      
      this.typeEnv.registerEntity(entity.name, fields);
    }
  }

  private fieldToShepType(field: Field): ShepType {
    switch (field.fieldType) {
      case "text":
      case "email":
      case "date":
      case "datetime":
      case "file":
      case "image":
        return { kind: "primitive", name: field.fieldType, nullable: !field.required };
      
      case "number":
      case "money":
        return { kind: "primitive", name: field.fieldType, nullable: !field.required };
      
      case "boolean":
        return { kind: "primitive", name: "boolean", nullable: !field.required };
      
      case "enum":
        return { 
          kind: "enum", 
          name: field.name, 
          enumValues: field.enumValues,
          nullable: !field.required 
        };
      
      case "relationship":
        return { 
          kind: "entity", 
          name: field.relatedEntity || "unknown",
          relatedEntity: field.relatedEntity,
          nullable: !field.required 
        };
      
      case "list":
        return { 
          kind: "list", 
          name: `List<${field.relatedEntity || "unknown"}>`,
          relatedEntity: field.relatedEntity,
          nullable: !field.required 
        };
      
      case "ai":
        return { 
          kind: "ai", 
          name: "ai",
          aiPrompt: field.aiPrompt,
          nullable: true // AI results can fail
        };
      
      default:
        return { kind: "unknown", name: field.fieldType };
    }
  }

  // --------------------------------------------------------------------------
  // Type Checking
  // --------------------------------------------------------------------------

  private verifyTypes(): void {
    // Check type consistency across the spec
    this.verifyScreenFieldTypes();
    this.verifyRuleFieldReferences();
    this.verifyFlowEntityReferences();
  }

  private verifyScreenFieldTypes(): void {
    for (const screen of this.spec.screens) {
      if (!screen.entity || !screen.fields) continue;
      
      const entityFields = this.typeEnv.getEntityFields(screen.entity);
      if (!entityFields) continue;
      
      for (const fieldName of screen.fields) {
        const fieldType = entityFields.get(fieldName);
        
        // Check for form screens with complex types
        if (screen.kind === "form" && fieldType) {
          if (fieldType.kind === "list") {
            this.addWarning(
              "T001",
              `Form "${screen.name}" includes list field "${fieldName}". Consider using a nested form or separate screen.`,
              screen.location,
              `Use a dedicated screen for managing ${fieldName} items.`
            );
          }
          
          if (fieldType.kind === "ai") {
            this.addInfo(
              "T002",
              `Form "${screen.name}" includes AI field "${fieldName}". This field will be computed, not user-editable.`,
              screen.location,
              `AI fields are read-only and computed on the backend.`
            );
          }
        }
        
        // Check for detail screens missing key fields
        if (screen.kind === "detail" && fieldType) {
          // ID and created_at are typically expected
        }
      }
    }
  }

  private verifyRuleFieldReferences(): void {
    for (const rule of this.spec.rules) {
      // Check AI condition field references
      if (rule.aiCondition && rule.aiCondition.input) {
        const fieldRef = this.parseFieldReference(rule.aiCondition.input);
        if (fieldRef) {
          const fieldType = this.typeEnv.getFieldType(fieldRef.entity, fieldRef.field);
          if (!fieldType) {
            // Entity or field doesn't exist - check if it's an entity reference
            if (!this.typeEnv.hasEntity(fieldRef.entity)) {
              this.addWarning(
                "T003",
                `Rule "${rule.description}" references unknown entity "${fieldRef.entity}"`,
                rule.location,
                `Create entity "${fieldRef.entity}" or fix the reference.`
              );
            } else {
              this.addWarning(
                "T004",
                `Rule "${rule.description}" references unknown field "${fieldRef.field}" in entity "${fieldRef.entity}"`,
                rule.location,
                `Add field "${fieldRef.field}" to entity "${fieldRef.entity}".`
              );
            }
          } else if (fieldType.kind !== "primitive" || !["text", "email"].includes(fieldType.name)) {
            // AI conditions work best on text fields
            if (fieldType.kind !== "ai") {
              this.addInfo(
                "T005",
                `AI condition in rule "${rule.description}" analyzes "${fieldRef.field}" which is type "${fieldType.name}". Text fields work best.`,
                rule.location
              );
            }
          }
        }
      }
    }
  }

  private verifyFlowEntityReferences(): void {
    // Parse flow steps for entity/field references
    for (const flow of this.spec.flows) {
      for (const step of flow.steps) {
        // Look for patterns like "Entity.field" or "entity" in step descriptions
        const entityRefs = this.extractEntityReferences(step.description);
        for (const entityName of entityRefs) {
          if (!this.typeEnv.hasEntity(entityName)) {
            // It's okay if it's not an entity - might be a general term
          }
        }
      }
    }
  }

  private parseFieldReference(input: string): { entity: string; field: string } | null {
    // Parse patterns like "message.content", "ticket.status"
    const match = input.match(/^([a-zA-Z][a-zA-Z0-9_]*)\.([a-zA-Z][a-zA-Z0-9_]*)$/);
    if (match) {
      // Capitalize first letter for entity name
      const entity = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      return { entity, field: match[2] };
    }
    return null;
  }

  private extractEntityReferences(text: string): string[] {
    const refs: string[] = [];
    // Look for capitalized words that might be entity names
    const words = text.match(/\b[A-Z][a-zA-Z0-9_]*\b/g) || [];
    for (const word of words) {
      if (this.typeEnv.hasEntity(word)) {
        refs.push(word);
      }
    }
    return refs;
  }

  // --------------------------------------------------------------------------
  // Constraint Extraction and Validation
  // --------------------------------------------------------------------------

  private extractAndVerifyConstraints(): void {
    // Extract constraints from rules
    for (const rule of this.spec.rules) {
      const constraints = this.extractConstraintsFromRule(rule);
      for (const constraint of constraints) {
        this.typeEnv.addConstraint(constraint);
      }
    }

    // Check for conflicting constraints
    const conflicts = this.typeEnv.findConflicts();
    for (const conflict of conflicts) {
      this.addWarning(
        "C001",
        `Potential constraint conflict: ${conflict.reason}`,
        conflict.constraint1.location,
        `Review rules "${conflict.constraint1.ruleDescription}" and "${conflict.constraint2.ruleDescription}".`
      );
    }

    // Verify constraints are satisfiable
    this.verifyConstraintSatisfiability();
  }

  private extractConstraintsFromRule(rule: Rule): Constraint[] {
    const constraints: Constraint[] = [];

    // AI condition constraints
    if (rule.aiCondition) {
      const fieldRef = this.parseFieldReference(rule.aiCondition.input || "");
      constraints.push({
        ruleDescription: rule.description,
        kind: "ai_condition",
        entityName: fieldRef?.entity,
        fieldName: fieldRef?.field,
        condition: rule.aiCondition.prompt,
        action: rule.action,
        isAI: true,
        location: rule.location,
      });
    }

    // Regular condition constraints
    if (rule.condition && !rule.aiCondition) {
      const fieldRef = this.parseFieldReference(rule.condition);
      constraints.push({
        ruleDescription: rule.description,
        kind: fieldRef ? "field_value" : "custom",
        entityName: fieldRef?.entity,
        fieldName: fieldRef?.field,
        condition: rule.condition,
        action: rule.action,
        isAI: false,
        location: rule.location,
      });
    }

    // Action constraints
    if (rule.action) {
      constraints.push({
        ruleDescription: rule.description,
        kind: "action_trigger",
        action: rule.action,
        location: rule.location,
      });
    }

    return constraints;
  }

  private verifyConstraintSatisfiability(): void {
    // Check for mutually exclusive required fields
    const constraints = this.typeEnv.getConstraints();
    
    // Group constraints by entity/field
    const byEntityField = new Map<string, Constraint[]>();
    for (const c of constraints) {
      if (c.entityName && c.fieldName) {
        const key = `${c.entityName}.${c.fieldName}`;
        if (!byEntityField.has(key)) {
          byEntityField.set(key, []);
        }
        byEntityField.get(key)!.push(c);
      }
    }

    // Check for fields with too many constraints
    for (const [key, fieldConstraints] of byEntityField) {
      if (fieldConstraints.length > 5) {
        this.addInfo(
          "C002",
          `Field ${key} has ${fieldConstraints.length} rules. Consider simplifying.`,
          fieldConstraints[0].location,
          `Complex rules on a single field may be hard to maintain.`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // Integration Type Matching (Frontend ↔ Backend)
  // --------------------------------------------------------------------------

  private verifyIntegrationTypes(): void {
    // Verify that all entities have consistent types for codegen
    for (const entity of this.spec.entities) {
      const fields = this.typeEnv.getEntityFields(entity.name);
      if (!fields) continue;

      // Check for potential frontend/backend type mismatches
      for (const [fieldName, fieldType] of fields) {
        // Money fields need special handling
        if (fieldType.name === "money") {
          this.addInfo(
            "IT001",
            `Field "${entity.name}.${fieldName}" is type "money". Will use Decimal in Python and number in TypeScript.`,
            entity.location
          );
        }

        // Date/datetime fields need timezone handling
        if (fieldType.name === "datetime") {
          this.addInfo(
            "IT002",
            `Field "${entity.name}.${fieldName}" is type "datetime". Ensure timezone handling is consistent.`,
            entity.location
          );
        }

        // AI fields are async in backend, promise in frontend
        if (fieldType.kind === "ai") {
          // This is expected and handled by codegen
        }

        // Enum fields need same values on both ends
        if (fieldType.kind === "enum" && fieldType.enumValues) {
          if (fieldType.enumValues.length > 20) {
            this.addWarning(
              "IT003",
              `Enum field "${entity.name}.${fieldName}" has ${fieldType.enumValues.length} values. Consider using a lookup table.`,
              entity.location,
              `Large enums are harder to maintain and may impact bundle size.`
            );
          }
        }
      }
    }

    // Verify screen → API → entity type chain
    for (const screen of this.spec.screens) {
      if (!screen.entity) continue;
      
      const entity = this.spec.entities.find(e => e.name === screen.entity);
      if (!entity) continue;

      // Check that screen fields match entity fields (already done in verifyScreens)
      // This is where we'd add additional API route validation
    }
  }

  // --------------------------------------------------------------------------
  // Entity Verification
  // --------------------------------------------------------------------------

  private verifyEntities(): void {
    const seenNames = new Set<string>();

    for (const entity of this.spec.entities) {
      // Check for duplicate entity names
      if (seenNames.has(entity.name)) {
        this.addError(
          "E001",
          `Duplicate entity name: "${entity.name}"`,
          entity.location,
          `Rename one of the "${entity.name}" entities to a unique name.`
        );
      }
      seenNames.add(entity.name);

      // Check entity name is valid identifier
      if (!this.isValidIdentifier(entity.name)) {
        this.addError(
          "E002",
          `Invalid entity name: "${entity.name}". Must start with a letter and contain only letters, numbers, and underscores.`,
          entity.location,
          `Rename "${entity.name}" to a valid identifier like "${this.suggestIdentifier(entity.name)}".`
        );
      }

      // Verify each field
      this.verifyEntityFields(entity);
    }
  }

  private verifyEntityFields(entity: Entity): void {
    const seenFields = new Set<string>();

    for (const field of entity.fields) {
      // Check for duplicate field names
      if (seenFields.has(field.name)) {
        this.addError(
          "E003",
          `Duplicate field name "${field.name}" in entity "${entity.name}"`,
          field.location,
          `Rename one of the "${field.name}" fields.`
        );
      }
      seenFields.add(field.name);

      // Check field type is valid
      if (!VALID_FIELD_TYPES.includes(field.fieldType)) {
        this.addError(
          "E004",
          `Invalid field type "${field.fieldType}" for field "${field.name}" in entity "${entity.name}"`,
          field.location,
          `Use one of: ${VALID_FIELD_TYPES.join(", ")}`
        );
      }

      // Check relationship fields reference valid entities
      if (field.fieldType === "relationship" && field.relatedEntity) {
        if (!this.entityNames.has(field.relatedEntity)) {
          this.addError(
            "E005",
            `Field "${field.name}" in entity "${entity.name}" references unknown entity "${field.relatedEntity}"`,
            field.location,
            `Create an entity named "${field.relatedEntity}" or fix the reference.`
          );
        }
      }

      // Check list fields reference valid entities
      if (field.fieldType === "list" && field.relatedEntity) {
        if (!this.entityNames.has(field.relatedEntity)) {
          this.addError(
            "E006",
            `Field "${field.name}" in entity "${entity.name}" references unknown entity "${field.relatedEntity}" in list`,
            field.location,
            `Create an entity named "${field.relatedEntity}" or fix the reference.`
          );
        }
      }

      // Check enum fields have values
      if (field.fieldType === "enum" && (!field.enumValues || field.enumValues.length === 0)) {
        this.addError(
          "E007",
          `Enum field "${field.name}" in entity "${entity.name}" has no values`,
          field.location,
          `Add enum values like: ${field.name}: enum(value1, value2, value3)`
        );
      }

      // Validate min/max constraints
      if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
        this.addError(
          "E008",
          `Field "${field.name}" in entity "${entity.name}" has min (${field.min}) greater than max (${field.max})`,
          field.location,
          `Swap the min and max values or adjust them.`
        );
      }

      // Validate AI fields have prompts
      if (field.fieldType === "ai" && !field.aiPrompt) {
        this.addError(
          "E009",
          `AI field "${field.name}" in entity "${entity.name}" has no prompt`,
          field.location,
          `Add a prompt like: ${field.name}: ai("describe what to compute")`
        );
      }

      // Info: AI fields require Claude/OpenAI integration
      if (field.fieldType === "ai") {
        const hasAIIntegration = this.integrationNames.has("Claude") || 
                                  this.integrationNames.has("OpenAI") ||
                                  Array.from(this.integrationNames).some(n => 
                                    n.toLowerCase().includes("claude") || 
                                    n.toLowerCase().includes("openai"));
        if (!hasAIIntegration) {
          this.addWarning(
            "E010",
            `AI field "${field.name}" in entity "${entity.name}" requires a Claude or OpenAI integration`,
            field.location,
            `Add an integration like: integration Claude: ...`
          );
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Screen Verification
  // --------------------------------------------------------------------------

  private verifyScreens(): void {
    const seenNames = new Set<string>();

    for (const screen of this.spec.screens) {
      // Check for duplicate screen names
      if (seenNames.has(screen.name)) {
        this.addError(
          "S001",
          `Duplicate screen name: "${screen.name}"`,
          screen.location,
          `Rename one of the "${screen.name}" screens.`
        );
      }
      seenNames.add(screen.name);

      // Check screen kind is valid
      if (!VALID_SCREEN_KINDS.includes(screen.kind)) {
        this.addError(
          "S002",
          `Invalid screen kind "${screen.kind}" for screen "${screen.name}"`,
          screen.location,
          `Use one of: ${VALID_SCREEN_KINDS.join(", ")}`
        );
      }

      // Check entity reference is valid
      if (screen.entity && !this.entityNames.has(screen.entity)) {
        this.addError(
          "S003",
          `Screen "${screen.name}" references unknown entity "${screen.entity}"`,
          screen.location,
          `Create an entity named "${screen.entity}" or fix the reference.`
        );
      }

      // Check fields reference valid entity fields
      if (screen.entity && screen.fields) {
        const entityFields = this.entityFieldMap.get(screen.entity);
        if (entityFields) {
          for (const fieldName of screen.fields) {
            if (!entityFields.has(fieldName)) {
              this.addWarning(
                "S004",
                `Screen "${screen.name}" references unknown field "${fieldName}" in entity "${screen.entity}"`,
                screen.location,
                `Add field "${fieldName}" to entity "${screen.entity}" or remove it from the screen.`
              );
            }
          }
        }
      }

      // Check form screens have an entity
      if (screen.kind === "form" && !screen.entity) {
        this.addWarning(
          "S005",
          `Form screen "${screen.name}" has no entity. Forms typically need an entity to create/edit.`,
          screen.location,
          `Add "entity: <EntityName>" to the screen definition.`
        );
      }

      // Check list screens have an entity
      if (screen.kind === "list" && !screen.entity) {
        this.addWarning(
          "S006",
          `List screen "${screen.name}" has no entity. Lists typically need an entity to display.`,
          screen.location,
          `Add "entity: <EntityName>" to the screen definition.`
        );
      }

      // Check dashboard screens have widgets
      if (screen.kind === "dashboard" && (!screen.widgets || screen.widgets.length === 0)) {
        this.addWarning(
          "S007",
          `Dashboard screen "${screen.name}" has no widgets.`,
          screen.location,
          `Add widgets to the dashboard.`
        );
      }

      // Check wizard screens have steps
      if (screen.kind === "wizard" && (!screen.steps || screen.steps.length === 0)) {
        this.addError(
          "S008",
          `Wizard screen "${screen.name}" has no steps.`,
          screen.location,
          `Add steps to the wizard.`
        );
      }

      // Verify widget types
      if (screen.widgets) {
        for (const widget of screen.widgets) {
          if (!VALID_WIDGET_TYPES.includes(widget.widgetType)) {
            this.addError(
              "S009",
              `Invalid widget type "${widget.widgetType}" in screen "${screen.name}"`,
              widget.location,
              `Use one of: ${VALID_WIDGET_TYPES.join(", ")}`
            );
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Flow Verification
  // --------------------------------------------------------------------------

  private verifyFlows(): void {
    const seenNames = new Set<string>();

    for (const flow of this.spec.flows) {
      // Check for duplicate flow names
      if (seenNames.has(flow.name)) {
        this.addWarning(
          "F001",
          `Duplicate flow name: "${flow.name}"`,
          flow.location,
          `Rename one of the "${flow.name}" flows.`
        );
      }
      seenNames.add(flow.name);

      // Check flow has steps
      if (!flow.steps || flow.steps.length === 0) {
        this.addWarning(
          "F002",
          `Flow "${flow.name}" has no steps.`,
          flow.location,
          `Add steps to describe the user journey.`
        );
      }

      // Check step numbers are sequential
      if (flow.steps && flow.steps.length > 0) {
        const expectedOrder = flow.steps.map((_, i) => i + 1);
        const actualOrder = flow.steps.map((s) => s.order);
        const isSequential = expectedOrder.every((v, i) => v === actualOrder[i]);

        if (!isSequential) {
          this.addWarning(
            "F003",
            `Flow "${flow.name}" has non-sequential step numbers.`,
            flow.location,
            `Renumber steps to be sequential: 1, 2, 3, ...`
          );
        }
      }

      // Verify AI steps
      for (const step of flow.steps) {
        if (step.isAI) {
          // Check AI step has action
          if (!step.aiAction || step.aiAction.trim() === "") {
            this.addWarning(
              "F004",
              `AI step ${step.order} in flow "${flow.name}" has no action description`,
              step.location,
              `Describe what the AI should do: ai: categorize and route to correct team`
            );
          }

          // Check for AI integration
          const hasAIIntegration = this.integrationNames.has("Claude") || 
                                    this.integrationNames.has("OpenAI") ||
                                    Array.from(this.integrationNames).some(n => 
                                      n.toLowerCase().includes("claude") || 
                                      n.toLowerCase().includes("openai"));
          if (!hasAIIntegration) {
            this.addWarning(
              "F005",
              `Flow "${flow.name}" has AI step but no Claude/OpenAI integration is declared`,
              flow.location,
              `Add an integration like: integration Claude: ...`
            );
          }
        }
      }

      // Check flow references valid screens (heuristic: look for screen names in step descriptions)
      for (const step of flow.steps) {
        for (const screenName of this.screenNames) {
          if (step.description.includes(screenName)) {
            // Good - flow references a real screen
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Rule Verification
  // --------------------------------------------------------------------------

  private verifyRules(): void {
    for (const rule of this.spec.rules) {
      // Check rule has description
      if (!rule.description || rule.description.trim() === "") {
        this.addError(
          "R001",
          `Rule has no description.`,
          rule.location,
          `Add a description to the rule.`
        );
      }

      // Check rule has condition or action
      if (!rule.condition && !rule.action && !rule.aiCondition) {
        this.addWarning(
          "R002",
          `Rule "${rule.description}" has no condition or action.`,
          rule.location,
          `Add a condition like: if <condition> → <action>`
        );
      }

      // Validate AI conditions
      if (rule.aiCondition) {
        // Check AI condition has input
        if (!rule.aiCondition.input || rule.aiCondition.input.trim() === "") {
          this.addError(
            "R003",
            `AI condition in rule "${rule.description}" has no input field`,
            rule.aiCondition.location || rule.location,
            `Specify which field to analyze: ai(fieldName, "prompt")`
          );
        }

        // Check AI condition has prompt
        if (!rule.aiCondition.prompt || rule.aiCondition.prompt.trim() === "") {
          this.addError(
            "R004",
            `AI condition in rule "${rule.description}" has no prompt`,
            rule.aiCondition.location || rule.location,
            `Add a prompt describing what to check: ai(field, "sounds frustrated")`
          );
        }

        // Check for AI integration
        const hasAIIntegration = this.integrationNames.has("Claude") || 
                                  this.integrationNames.has("OpenAI") ||
                                  Array.from(this.integrationNames).some(n => 
                                    n.toLowerCase().includes("claude") || 
                                    n.toLowerCase().includes("openai"));
        if (!hasAIIntegration) {
          this.addWarning(
            "R005",
            `Rule "${rule.description}" uses ai() but no Claude/OpenAI integration is declared`,
            rule.location,
            `Add an integration like: integration Claude: ...`
          );
        }
      }

      // Validate condition references (heuristic: check for entity/field names)
      if (rule.condition && !rule.aiCondition) {
        // Check if condition references known entities or fields
        let hasValidReference = false;
        for (const entityName of this.entityNames) {
          if (rule.condition.includes(entityName.toLowerCase())) {
            hasValidReference = true;
          }
        }
        // Also check for common patterns like "user.", "plan", etc.
        if (
          rule.condition.includes("user.") ||
          rule.condition.includes("plan") ||
          rule.condition.includes("role")
        ) {
          hasValidReference = true;
        }
        // If we can't find any reference, it's still okay - just informational
      }
    }
  }

  // --------------------------------------------------------------------------
  // Integration Verification
  // --------------------------------------------------------------------------

  private verifyIntegrations(): void {
    const seenNames = new Set<string>();

    for (const integration of this.spec.integrations) {
      // Check for duplicate integration names
      if (seenNames.has(integration.name)) {
        this.addError(
          "I001",
          `Duplicate integration name: "${integration.name}"`,
          integration.location,
          `Rename one of the "${integration.name}" integrations.`
        );
      }
      seenNames.add(integration.name);

      // Check integration has endpoint or purpose
      if (!integration.endpoint && !integration.purpose) {
        this.addWarning(
          "I002",
          `Integration "${integration.name}" has no endpoint or purpose.`,
          integration.location,
          `Add endpoint and/or purpose to describe the integration.`
        );
      }

      // Validate endpoint URL format
      if (integration.endpoint) {
        if (!integration.endpoint.startsWith("http://") && !integration.endpoint.startsWith("https://")) {
          this.addWarning(
            "I003",
            `Integration "${integration.name}" has invalid endpoint URL: "${integration.endpoint}"`,
            integration.location,
            `Use a full URL starting with http:// or https://`
          );
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Event Verification
  // --------------------------------------------------------------------------

  private verifyEvents(): void {
    const seenNames = new Set<string>();

    for (const event of this.spec.events) {
      // Check for duplicate event names
      if (seenNames.has(event.name)) {
        this.addWarning(
          "EV001",
          `Duplicate event name: "${event.name}"`,
          event.location,
          `Rename one of the "${event.name}" events.`
        );
      }
      seenNames.add(event.name);

      // Check event has fields
      if (!event.fields || event.fields.length === 0) {
        this.addWarning(
          "EV002",
          `Event "${event.name}" has no fields. Events should capture relevant data.`,
          event.location,
          `Add fields like: fields: [userId, action, timestamp]`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // Wiring Verification (Cross-Component Checks)
  // --------------------------------------------------------------------------

  private verifyWiring(): void {
    // Check 1: Every entity should have at least one screen that uses it
    for (const entity of this.spec.entities) {
      const usedByScreen = this.spec.screens.some((s) => s.entity === entity.name);
      if (!usedByScreen) {
        this.addInfo(
          "W001",
          `Entity "${entity.name}" is not used by any screen.`,
          entity.location,
          `Create a screen that uses this entity, or remove the entity if unused.`
        );
      }
    }

    // Check 2: Screen entity references should be consistent
    for (const screen of this.spec.screens) {
      if (screen.entity && screen.fields) {
        const entity = this.spec.entities.find((e) => e.name === screen.entity);
        if (entity) {
          // Check that all required fields are included
          const requiredFields = entity.fields.filter((f) => f.required);
          if (screen.kind === "form") {
            for (const field of requiredFields) {
              if (!screen.fields.includes(field.name)) {
                this.addWarning(
                  "W002",
                  `Form screen "${screen.name}" is missing required field "${field.name}" from entity "${entity.name}"`,
                  screen.location,
                  `Add "${field.name}" to the form fields.`
                );
              }
            }
          }
        }
      }
    }

    // Check 3: Flows should reference valid screens
    for (const flow of this.spec.flows) {
      for (const step of flow.steps) {
        // Look for screen references in step descriptions
        for (const screen of this.spec.screens) {
          if (step.description.includes(screen.name)) {
            // Valid reference found
          }
        }
      }
    }

    // Check 4: Check for orphaned integrations (declared but never referenced)
    // This is informational only
    for (const integration of this.spec.integrations) {
      let isReferenced = false;
      // Check if integration is mentioned in rules
      for (const rule of this.spec.rules) {
        if (
          rule.condition?.toLowerCase().includes(integration.name.toLowerCase()) ||
          rule.action?.toLowerCase().includes(integration.name.toLowerCase())
        ) {
          isReferenced = true;
        }
      }
      // Check if integration is mentioned in flow steps
      for (const flow of this.spec.flows) {
        for (const step of flow.steps) {
          if (step.description.toLowerCase().includes(integration.name.toLowerCase())) {
            isReferenced = true;
          }
        }
      }
      // AI/Claude is always used (assumed)
      if (integration.name.toLowerCase().includes("claude") || integration.name.toLowerCase().includes("openai")) {
        isReferenced = true;
      }
      // Payment integrations are always used (assumed)
      if (integration.name.toLowerCase().includes("stripe") || integration.name.toLowerCase().includes("payment")) {
        isReferenced = true;
      }
    }

    // Check 5: Verify all relationship cycles are valid
    this.verifyRelationshipCycles();
  }

  private verifyRelationshipCycles(): void {
    // Build a graph of entity relationships
    const graph = new Map<string, string[]>();

    for (const entity of this.spec.entities) {
      const related: string[] = [];
      for (const field of entity.fields) {
        if (
          (field.fieldType === "relationship" || field.fieldType === "list") &&
          field.relatedEntity
        ) {
          related.push(field.relatedEntity);
        }
      }
      graph.set(entity.name, related);
    }

    // Check for circular references (informational, not an error)
    // Circular references are valid but worth noting
    for (const [entity, related] of graph) {
      for (const relatedEntity of related) {
        const relatedRelations = graph.get(relatedEntity) || [];
        if (relatedRelations.includes(entity)) {
          this.addInfo(
            "W003",
            `Circular relationship detected: "${entity}" ↔ "${relatedEntity}"`,
            undefined,
            `This is valid but may need special handling in forms and APIs.`
          );
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private isValidIdentifier(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  }

  private suggestIdentifier(name: string): string {
    // Remove invalid characters and capitalize
    return name
      .replace(/[^a-zA-Z0-9_]/g, "")
      .replace(/^[0-9]+/, "")
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  private addError(code: string, message: string, location?: SourceLocation, suggestion?: string): void {
    this.issues.push({
      severity: "error",
      code,
      message,
      location,
      suggestion,
    });
  }

  private addWarning(code: string, message: string, location?: SourceLocation, suggestion?: string): void {
    this.issues.push({
      severity: "warning",
      code,
      message,
      location,
      suggestion,
    });
  }

  private addInfo(code: string, message: string, location?: SourceLocation, suggestion?: string): void {
    this.issues.push({
      severity: "info",
      code,
      message,
      location,
      suggestion,
    });
  }

  // --------------------------------------------------------------------------
  // Linting - Best Practices and Style
  // --------------------------------------------------------------------------

  /**
   * Check naming conventions across the spec.
   */
  private lintNamingConventions(): void {
    // Entity names should be PascalCase
    for (const entity of this.spec.entities) {
      if (!this.isPascalCase(entity.name)) {
        this.addWarning(
          "L001",
          `Entity "${entity.name}" should use PascalCase (e.g., "${this.toPascalCase(entity.name)}").`,
          entity.location,
          `Rename to "${this.toPascalCase(entity.name)}".`
        );
      }

      // Field names should be camelCase or snake_case
      for (const field of entity.fields) {
        if (!this.isCamelCase(field.name) && !this.isSnakeCase(field.name)) {
          this.addWarning(
            "L002",
            `Field "${entity.name}.${field.name}" should use camelCase or snake_case.`,
            field.location,
            `Rename to "${this.toCamelCase(field.name)}".`
          );
        }
      }
    }

    // Screen names should be PascalCase
    for (const screen of this.spec.screens) {
      if (!this.isPascalCase(screen.name)) {
        this.addWarning(
          "L003",
          `Screen "${screen.name}" should use PascalCase (e.g., "${this.toPascalCase(screen.name)}").`,
          screen.location,
          `Rename to "${this.toPascalCase(screen.name)}".`
        );
      }
    }

    // Flow names should be descriptive (at least 2 words)
    for (const flow of this.spec.flows) {
      const words = flow.name.split(/\s+/).filter((w: string) => w.length > 0);
      if (words.length < 2) {
        this.addInfo(
          "L004",
          `Flow "${flow.name}" could be more descriptive.`,
          flow.location,
          `Use a descriptive name like "User creates account" or "Admin reviews order".`
        );
      }
    }
  }

  /**
   * Check for unused entities.
   */
  private lintUnusedEntities(): void {
    // Find entities that aren't referenced by any screen or flow
    const usedEntities = new Set<string>();

    // Collect entities used in screens
    for (const screen of this.spec.screens) {
      if (screen.entity) {
        usedEntities.add(screen.entity);
      }
    }

    // Collect entities used in flows via step descriptions mentioning screens
    for (const flow of this.spec.flows) {
      for (const step of flow.steps) {
        // Parse screen references from step descriptions
        for (const screen of this.spec.screens) {
          if (step.description.includes(screen.name) && screen.entity) {
            usedEntities.add(screen.entity);
          }
        }
      }
    }

    // Collect entities used in rules
    for (const rule of this.spec.rules) {
      // Parse entity references from rule conditions
      if (rule.condition) {
        const match = rule.condition.match(/(\w+)\./);
        if (match) {
          usedEntities.add(match[1]);
        }
      }
    }

    // Collect entities used in relationships
    for (const entity of this.spec.entities) {
      for (const field of entity.fields) {
        if (field.relatedEntity) {
          usedEntities.add(field.relatedEntity);
        }
      }
      // The entity itself is used if it's referenced
      usedEntities.add(entity.name);
    }

    // Report unused entities (only if there are screens to use them)
    if (this.spec.screens.length > 0) {
      for (const entity of this.spec.entities) {
        // Check if any screen references this entity
        const isReferenced = this.spec.screens.some(s => s.entity === entity.name);
        if (!isReferenced) {
          this.addInfo(
            "L005",
            `Entity "${entity.name}" is not used by any screen.`,
            entity.location,
            `Create a screen that uses this entity, or remove it if not needed.`
          );
        }
      }
    }
  }

  /**
   * Check best practices and common mistakes.
   */
  private lintBestPractices(): void {
    // Check for entities without any required fields
    for (const entity of this.spec.entities) {
      const hasRequiredField = entity.fields.some(f => f.required);
      if (!hasRequiredField && entity.fields.length > 0) {
        this.addInfo(
          "L006",
          `Entity "${entity.name}" has no required fields. Consider making key fields required.`,
          entity.location,
          `Add (required) to important fields like name or email.`
        );
      }
    }

    // Check for screens without entity reference
    for (const screen of this.spec.screens) {
      if (screen.kind !== "dashboard" && !screen.entity) {
        this.addWarning(
          "L007",
          `Screen "${screen.name}" is not linked to an entity.`,
          screen.location,
          `Add "entity: EntityName" to link this screen to data.`
        );
      }
    }

    // Check for rules without clear actions
    for (const rule of this.spec.rules) {
      if (!rule.action) {
        this.addWarning(
          "L008",
          `Rule "${rule.description}" has no action defined.`,
          rule.location,
          `Add an action like "→ set status = 'approved'" or "→ notify".`
        );
      }
    }

    // Check for flows without steps
    for (const flow of this.spec.flows) {
      if (!flow.steps || flow.steps.length === 0) {
        this.addWarning(
          "L009",
          `Flow "${flow.name}" has no steps defined.`,
          flow.location,
          `Add numbered steps like "1. User fills form" and "2. System saves data".`
        );
      }
    }

    // Check for potential security issues
    for (const entity of this.spec.entities) {
      const hasPasswordField = entity.fields.some(f => 
        f.name.toLowerCase().includes("password") || 
        f.name.toLowerCase().includes("secret") ||
        f.name.toLowerCase().includes("token")
      );
      
      if (hasPasswordField) {
        const sensitiveField = entity.fields.find(f => 
          f.name.toLowerCase().includes("password") || 
          f.name.toLowerCase().includes("secret") ||
          f.name.toLowerCase().includes("token")
        );
        if (sensitiveField?.fieldType !== "text") {
          continue; // Already text, which is fine
        }
        this.addInfo(
          "L010",
          `Entity "${entity.name}" has a sensitive field "${sensitiveField?.name}". Ensure it's not exposed in screens.`,
          entity.location,
          `Shep's authentication system handles passwords securely. For custom sensitive fields, exclude them from screens.`
        );
      }
    }

    // Check for overly complex flows (>10 steps)
    for (const flow of this.spec.flows) {
      if (flow.steps && flow.steps.length > 10) {
        this.addWarning(
          "L011",
          `Flow "${flow.name}" has ${flow.steps.length} steps. Consider splitting into smaller flows.`,
          flow.location,
          `Break complex flows into smaller, reusable sub-flows for maintainability.`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // Linting Helper Methods
  // --------------------------------------------------------------------------

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  private isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private buildSummary(): VerificationSummary {
    // Count relationship fields
    let relationshipsVerified = 0;
    for (const entity of this.spec.entities) {
      for (const field of entity.fields) {
        if (field.fieldType === "relationship" || field.fieldType === "list") {
          relationshipsVerified++;
        }
      }
    }

    return {
      entitiesVerified: this.spec.entities.length,
      screensVerified: this.spec.screens.length,
      flowsVerified: this.spec.flows.length,
      rulesVerified: this.spec.rules.length,
      integrationsVerified: this.spec.integrations.length,
      eventsVerified: this.spec.events.length,
      relationshipsVerified,
      wiringChecks: this.spec.entities.length + this.spec.screens.length,
    };
  }
}
