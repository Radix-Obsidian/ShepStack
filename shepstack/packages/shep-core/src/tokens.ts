/**
 * Token types for the Shep language.
 */
export enum TokenType {
  // Literals
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",

  // Keywords
  COMPONENT = "COMPONENT",
  ROUTE = "ROUTE",
  MODEL = "MODEL",
  ENDPOINT = "ENDPOINT",
  VERTICAL_SLICE = "VERTICAL_SLICE",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  FROM = "FROM",
  TYPE = "TYPE",
  INTERFACE = "INTERFACE",
  ENUM = "ENUM",
  IF = "IF",
  ELSE = "ELSE",
  FOR = "FOR",
  WHILE = "WHILE",
  FUNCTION = "FUNCTION",
  RETURN = "RETURN",
  CONST = "CONST",
  LET = "LET",
  VAR = "VAR",
  ASYNC = "ASYNC",
  AWAIT = "AWAIT",
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",
  UNDEFINED = "UNDEFINED",

  // Operators
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  PERCENT = "PERCENT",
  ASSIGN = "ASSIGN",
  PLUS_ASSIGN = "PLUS_ASSIGN",
  MINUS_ASSIGN = "MINUS_ASSIGN",
  STAR_ASSIGN = "STAR_ASSIGN",
  SLASH_ASSIGN = "SLASH_ASSIGN",
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  STRICT_EQUAL = "STRICT_EQUAL",
  STRICT_NOT_EQUAL = "STRICT_NOT_EQUAL",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN = "GREATER_THAN",
  LESS_EQUAL = "LESS_EQUAL",
  GREATER_EQUAL = "GREATER_EQUAL",
  LOGICAL_AND = "LOGICAL_AND",
  LOGICAL_OR = "LOGICAL_OR",
  LOGICAL_NOT = "LOGICAL_NOT",
  BITWISE_AND = "BITWISE_AND",
  BITWISE_OR = "BITWISE_OR",
  BITWISE_XOR = "BITWISE_XOR",
  BITWISE_NOT = "BITWISE_NOT",
  LEFT_SHIFT = "LEFT_SHIFT",
  RIGHT_SHIFT = "RIGHT_SHIFT",
  QUESTION = "QUESTION",
  COLON = "COLON",
  ARROW = "ARROW",
  DOT = "DOT",
  SPREAD = "SPREAD",

  // Delimiters
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  AT = "AT",

  // Special
  EOF = "EOF",
  NEWLINE = "NEWLINE",
  COMMENT = "COMMENT",
}

/**
 * Represents a single token in the source code.
 */
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  length: number;
}

/**
 * Creates a new token.
 */
export function createToken(
  type: TokenType,
  value: string,
  line: number,
  column: number,
  length: number = value.length
): Token {
  return { type, value, line, column, length };
}
