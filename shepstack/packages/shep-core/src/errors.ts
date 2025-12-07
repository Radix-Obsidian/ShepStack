/**
 * Base error class for Shep language errors.
 */
export class ShepError extends Error {
  constructor(
    message: string,
    public readonly code: string = "SHEP_ERROR",
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = "ShepError";
  }
}

/**
 * Thrown when a feature is not yet implemented.
 */
export class NotImplementedError extends ShepError {
  constructor(message: string) {
    super(message, "NOT_IMPLEMENTED");
    this.name = "NotImplementedError";
  }
}

/**
 * Thrown when a syntax error is encountered during parsing.
 */
export class SyntaxError extends ShepError {
  constructor(message: string, line?: number, column?: number) {
    super(message, "SYNTAX_ERROR", line, column);
    this.name = "SyntaxError";
  }
}

/**
 * Thrown when a type error is encountered.
 */
export class TypeError extends ShepError {
  constructor(message: string, line?: number, column?: number) {
    super(message, "TYPE_ERROR", line, column);
    this.name = "TypeError";
  }
}
