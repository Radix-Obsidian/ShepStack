/**
 * Shep Core: The spec parser, verifier, and code generator foundation
 *
 * Exports the spec types, parser, verifier, and helper functions
 * for parsing and verifying .shep files written by founders.
 */

// Errors
export { ShepError, NotImplementedError, SyntaxError, TypeError } from "./errors.js";

// Spec Types (the new architecture)
export type {
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
} from "./spec.js";

export {
  createEmptySpec,
  successResult,
  errorResult,
} from "./spec.js";

// Spec Parser
export { parseSpec } from "./parser.js";

// Verification Engine
export type {
  VerificationResult,
  VerificationIssue,
  VerificationSummary,
  IssueSeverity,
  ShepType,
  Constraint,
} from "./verifier.js";

export { verifySpec } from "./verifier.js";
