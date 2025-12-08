/**
 * Shep Specification AST (Abstract Syntax Tree)
 *
 * This module defines the structure of a parsed Shep spec.
 * Shep specs are written by founders to describe their product.
 * The AST is produced by the parser and consumed by the verifier and codegen.
 */

// ============================================================================
// Source Location
// ============================================================================

/**
 * Source location information for error reporting.
 */
export interface SourceLocation {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Source file path */
  file?: string;
}

// ============================================================================
// Top-Level Spec
// ============================================================================

/**
 * The root of a Shep specification.
 * Represents an entire .shep file.
 */
export interface ShepSpec {
  /** The app name (e.g., "SupportAI") */
  app: string;
  /** All entities defined in this spec */
  entities: Entity[];
  /** All screens defined in this spec */
  screens: Screen[];
  /** All flows defined in this spec */
  flows: Flow[];
  /** All rules defined in this spec */
  rules: Rule[];
  /** All integrations declared in this spec */
  integrations: Integration[];
  /** All events defined in this spec */
  events: Event[];
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Entities (Data Models)
// ============================================================================

/**
 * An entity represents a data model (like User, Company, Order).
 * Compiles to: Pydantic model (Python) + TypeScript interface + DB table
 */
export interface Entity {
  /** Entity name (e.g., "User", "Company") */
  name: string;
  /** Fields in this entity */
  fields: Field[];
  /** Source location */
  location?: SourceLocation;
}

/**
 * A field in an entity.
 */
export interface Field {
  /** Field name (e.g., "name", "email") */
  name: string;
  /** Field type (e.g., "text", "email", "number") */
  fieldType: FieldType;
  /** Whether this field is required */
  required: boolean;
  /** Whether this field must be unique */
  unique: boolean;
  /** Minimum value (for numbers) or minimum length (for text) */
  min?: number;
  /** Maximum value (for numbers) or maximum length (for text) */
  max?: number;
  /** Regex pattern for validation */
  pattern?: string;
  /** Default value */
  defaultValue?: string | number | boolean;
  /** For relationship fields: the related entity name */
  relatedEntity?: string;
  /** For enum fields: the allowed values */
  enumValues?: string[];
  /** For AI fields: the prompt describing what to compute */
  aiPrompt?: string;
  /** For AI fields: the source field(s) to derive from */
  aiSourceFields?: string[];
  /** For computed fields: expression to compute value */
  computedExpression?: string;
  /** Whether this is a computed field (derived from other fields) */
  computed?: boolean;
  /** Source location */
  location?: SourceLocation;
}

/**
 * Built-in field types that founders can use.
 * These are human-readable, not programmer-speak.
 */
export type FieldType =
  | "text" // string
  | "number" // number
  | "money" // number (formatted as currency)
  | "email" // string with email validation
  | "date" // date only
  | "datetime" // date and time
  | "boolean" // true/false
  | "file" // file upload reference
  | "image" // image upload reference
  | "enum" // predefined set of values
  | "relationship" // reference to another entity
  | "list" // array of another type
  | "ai" // AI-derived field (computed by LLM)
  // Advanced types (added for production readiness)
  | "uuid" // UUID/GUID
  | "url" // URL with validation
  | "phone" // phone number
  | "json" // arbitrary JSON data
  | "array" // simple array of primitives
  | "computed"; // computed from other fields

// ============================================================================
// Screens (UI Definitions)
// ============================================================================

/**
 * A screen represents a UI view (like Dashboard, SignUp, List).
 * Compiles to: React component + API route (if needed)
 */
export interface Screen {
  /** Screen name (e.g., "Dashboard", "SignUp") */
  name: string;
  /** Kind of screen */
  kind: ScreenKind;
  /** Entity this screen is based on (for forms, lists, details) */
  entity?: string;
  /** Fields to show (for forms) */
  fields?: string[];
  /** Filters available (for lists) */
  filters?: string[];
  /** Actions available on this screen */
  actions?: string[];
  /** Steps (for wizards) */
  steps?: WizardStep[];
  /** Widgets (for dashboards) */
  widgets?: DashboardWidget[];
  /** Action button text (for forms) */
  actionText?: string;
  /** Source location */
  location?: SourceLocation;
}

/**
 * Types of screens founders can define.
 */
export type ScreenKind =
  | "form" // Create/edit form
  | "list" // List of items with filters
  | "detail" // Single item detail view
  | "dashboard" // Dashboard with widgets
  | "wizard" // Multi-step form
  | "api"; // API-only endpoint (no UI)

/**
 * A step in a wizard screen.
 */
export interface WizardStep {
  /** Step name (e.g., "Basic Info") */
  name: string;
  /** Fields shown in this step */
  fields: string[];
  /** Source location */
  location?: SourceLocation;
}

/**
 * A widget in a dashboard screen.
 */
export interface DashboardWidget {
  /** Widget label (e.g., "Total Users") */
  label: string;
  /** Widget type */
  widgetType: "number" | "percentage" | "rating" | "list" | "chart";
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Flows (User Journeys)
// ============================================================================

/**
 * A flow represents a user journey (sequence of steps).
 * Used for verification and documentation.
 */
export interface Flow {
  /** Flow name (e.g., "User signs up") */
  name: string;
  /** Steps in this flow */
  steps: FlowStep[];
  /** Source location */
  location?: SourceLocation;
}

/**
 * A step in a flow.
 */
export interface FlowStep {
  /** Step number (1-indexed) */
  order: number;
  /** Step description (e.g., "User fills SignUp form") */
  description: string;
  /** Whether this is an AI-powered step */
  isAI?: boolean;
  /** For AI steps: the action to perform */
  aiAction?: string;
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Rules (Business Constraints)
// ============================================================================

/**
 * A rule represents a business constraint.
 * Compiles to: validation logic in Python + TypeScript
 */
export interface Rule {
  /** Rule description (e.g., "Only founders can create startups") */
  description: string;
  /** Condition expression (e.g., "user.role != founder") */
  condition?: string;
  /** Action when condition is true (e.g., "show error") */
  action?: string;
  /** Error message to show */
  errorMessage?: string;
  /** AI condition: an ai() call that evaluates the condition */
  aiCondition?: AICall;
  /** Source location */
  location?: SourceLocation;
}

/**
 * An AI call represents a use of ai() in the spec.
 * This is Shep's differentiator: AI as a language primitive.
 */
export interface AICall {
  /** The input field or expression to analyze */
  input: string;
  /** The prompt describing what to analyze/classify */
  prompt: string;
  /** Expected output type (for validation) */
  outputType?: "boolean" | "text" | "number" | "enum";
  /** For enum outputs: the valid values */
  enumValues?: string[];
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Integrations (External Services)
// ============================================================================

/**
 * An integration declares an external service used by the app.
 */
export interface Integration {
  /** Service name (e.g., "Stripe", "SendGrid", "Claude") */
  name: string;
  /** API endpoint (optional) */
  endpoint?: string;
  /** Purpose description (e.g., "Handle payments") */
  purpose?: string;
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Events (Analytics)
// ============================================================================

/**
 * An event represents an analytics event to track.
 */
export interface Event {
  /** Event name (e.g., "question_answered") */
  name: string;
  /** Fields to include in this event */
  fields: string[];
  /** Source location */
  location?: SourceLocation;
}

// ============================================================================
// Parse Result
// ============================================================================

/**
 * Result of parsing a .shep file.
 */
export interface ParseResult {
  /** Whether parsing succeeded */
  success: boolean;
  /** The parsed spec (if successful) */
  spec?: ShepSpec;
  /** Parse errors (if any) */
  errors: ParseError[];
}

/**
 * A parse error.
 */
export interface ParseError {
  /** Error message */
  message: string;
  /** Location of the error */
  location?: SourceLocation;
  /** Suggestion for how to fix */
  suggestion?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an empty spec with the given app name.
 */
export function createEmptySpec(appName: string): ShepSpec {
  return {
    app: appName,
    entities: [],
    screens: [],
    flows: [],
    rules: [],
    integrations: [],
    events: [],
  };
}

/**
 * Create a successful parse result.
 */
export function successResult(spec: ShepSpec): ParseResult {
  return {
    success: true,
    spec,
    errors: [],
  };
}

/**
 * Create a failed parse result.
 */
export function errorResult(errors: ParseError[]): ParseResult {
  return {
    success: false,
    errors,
  };
}
