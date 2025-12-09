/**
 * Python code generation for Shepthon.
 * Transforms Shepthon spec to Python source code.
 */

import type { ShepSpec } from "@goldensheepai/shep-core";
import { NotImplementedError } from "@goldensheepai/shep-core";

/**
 * Generates Python code from a Shepthon spec.
 * Currently a stub.
 *
 * @param spec The Shepthon spec
 * @returns Python source code
 * @throws NotImplementedError
 */
export function generatePython(spec: ShepSpec): string {
  // TODO: Implement spec traversal and Python code generation
  throw new NotImplementedError("Python code generation not yet implemented.");
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
   * Include type hints.
   */
  typeHints?: boolean;

  /**
   * Pretty-print output.
   */
  pretty?: boolean;
}

/**
 * Creates a Python code generator.
 */
export function createPythonGenerator(options: CodegenOptions = {}) {
  const { indentSize = 4, typeHints = true, pretty = true } = options;

  return {
    generate: (spec: ShepSpec): string => {
      return generatePython(spec);
    },
    options: { indentSize, typeHints, pretty },
  };
}
