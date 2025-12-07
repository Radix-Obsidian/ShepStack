/**
 * TypeScript code generation for Sheplang.
 * Transforms Sheplang spec to TypeScript source code.
 */

import type { ShepSpec } from "@shep/core";
import { NotImplementedError } from "@shep/core";

/**
 * Generates TypeScript code from a Sheplang spec.
 * Currently a stub.
 *
 * @param spec The Sheplang spec
 * @returns TypeScript source code
 * @throws NotImplementedError
 */
export function generateTypeScript(spec: ShepSpec): string {
  // TODO: Implement spec traversal and TypeScript code generation
  throw new NotImplementedError(
    "TypeScript code generation not yet implemented."
  );
}

/**
 * Code generation options.
 */
export interface CodegenOptions {
  /**
   * Indent size (spaces).
   */
  indentSize?: number;

  /**
   * Include source maps.
   */
  sourceMap?: boolean;

  /**
   * Pretty-print output.
   */
  pretty?: boolean;
}

/**
 * Creates a TypeScript code generator.
 */
export function createTypeScriptGenerator(options: CodegenOptions = {}) {
  const { indentSize = 2, pretty = true } = options;

  return {
    generate: (spec: ShepSpec): string => {
      return generateTypeScript(spec);
    },
    options: { indentSize, pretty },
  };
}
