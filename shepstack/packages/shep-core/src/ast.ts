/**
 * Abstract Syntax Tree node definitions for the Shep language.
 */

/**
 * Base interface for all AST nodes.
 */
export interface ASTNode {
  type: string;
  line: number;
  column: number;
}

/**
 * Root node of a Shep program.
 */
export interface Program extends ASTNode {
  type: "Program";
  body: Statement[];
}

/**
 * Base interface for statements.
 */
export interface Statement extends ASTNode {
  type: string;
}

/**
 * Base interface for expressions.
 */
export interface Expression extends ASTNode {
  type: string;
}

/**
 * Identifier node.
 */
export interface Identifier extends Expression {
  type: "Identifier";
  name: string;
}

/**
 * Literal node (number, string, boolean, null).
 */
export interface Literal extends Expression {
  type: "Literal";
  value: string | number | boolean | null;
  raw: string;
}

/**
 * Binary operation node.
 */
export interface BinaryExpression extends Expression {
  type: "BinaryExpression";
  left: Expression;
  operator: string;
  right: Expression;
}

/**
 * Unary operation node.
 */
export interface UnaryExpression extends Expression {
  type: "UnaryExpression";
  operator: string;
  argument: Expression;
  prefix: boolean;
}

/**
 * Function call node.
 */
export interface CallExpression extends Expression {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

/**
 * Member access node (e.g., obj.prop or obj[key]).
 */
export interface MemberExpression extends Expression {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
}

/**
 * Array literal node.
 */
export interface ArrayExpression extends Expression {
  type: "ArrayExpression";
  elements: (Expression | null)[];
}

/**
 * Object literal node.
 */
export interface ObjectExpression extends Expression {
  type: "ObjectExpression";
  properties: Property[];
}

/**
 * Object property node.
 */
export interface Property extends ASTNode {
  type: "Property";
  key: Expression;
  value: Expression;
  computed: boolean;
  shorthand: boolean;
}

/**
 * Block statement node.
 */
export interface BlockStatement extends Statement {
  type: "BlockStatement";
  body: Statement[];
}

/**
 * Expression statement node.
 */
export interface ExpressionStatement extends Statement {
  type: "ExpressionStatement";
  expression: Expression;
}

/**
 * Variable declaration node.
 */
export interface VariableDeclaration extends Statement {
  type: "VariableDeclaration";
  kind: "const" | "let" | "var";
  declarations: VariableDeclarator[];
}

/**
 * Variable declarator node.
 */
export interface VariableDeclarator extends ASTNode {
  type: "VariableDeclarator";
  id: Identifier;
  init: Expression | null;
}

/**
 * Function declaration node.
 */
export interface FunctionDeclaration extends Statement {
  type: "FunctionDeclaration";
  id: Identifier | null;
  params: Parameter[];
  body: BlockStatement;
  async: boolean;
}

/**
 * Function parameter node.
 */
export interface Parameter extends ASTNode {
  type: "Parameter";
  name: Identifier;
  typeAnnotation?: TypeAnnotation;
  defaultValue?: Expression;
}

/**
 * Type annotation node.
 */
export interface TypeAnnotation extends ASTNode {
  type: "TypeAnnotation";
  typeString: string;
}

/**
 * Return statement node.
 */
export interface ReturnStatement extends Statement {
  type: "ReturnStatement";
  argument: Expression | null;
}

/**
 * If statement node.
 */
export interface IfStatement extends Statement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

/**
 * For loop node.
 */
export interface ForStatement extends Statement {
  type: "ForStatement";
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

/**
 * While loop node.
 */
export interface WhileStatement extends Statement {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}

/**
 * Component declaration (Sheplang-specific).
 */
export interface ComponentDeclaration extends Statement {
  type: "ComponentDeclaration";
  id: Identifier;
  props: Parameter[];
  body: BlockStatement;
}

/**
 * Route declaration (Sheplang-specific).
 */
export interface RouteDeclaration extends Statement {
  type: "RouteDeclaration";
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  handler: FunctionDeclaration;
}

/**
 * Model declaration (Sheplang-specific).
 */
export interface ModelDeclaration extends Statement {
  type: "ModelDeclaration";
  id: Identifier;
  fields: ModelField[];
}

/**
 * Model field definition.
 */
export interface ModelField extends ASTNode {
  type: "ModelField";
  name: Identifier;
  typeAnnotation: TypeAnnotation;
  optional: boolean;
}

/**
 * Vertical slice declaration (Sheplang-specific).
 */
export interface VerticalSliceDeclaration extends Statement {
  type: "VerticalSliceDeclaration";
  id: Identifier;
  components: ComponentDeclaration[];
  routes: RouteDeclaration[];
  models: ModelDeclaration[];
}

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
 * Source location information for AST nodes.
 */
export interface SourceLocation {
  /** Starting line (1-indexed) */
  line: number;
  /** Starting column (1-indexed) */
  column: number;
  /** Source file path (optional) */
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
  /** Default value */
  defaultValue?: string | number | boolean;
  /** For relationship fields: the related entity name */
  relatedEntity?: string;
  /** For enum fields: the allowed values */
  enumValues?: string[];
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
  | "list"; // array of another type

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
