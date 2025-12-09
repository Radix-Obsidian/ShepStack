/**
 * Shepthon: Python-targeting compiler
 *
 * Compiles Shep source code to Python.
 */

import { NotImplementedError } from "@goldensheepai/shep-core";

/**
 * Compiles Shepthon source code to Python.
 * Currently a stub.
 *
 * @param source The Shepthon source code
 * @returns Python source code
 * @throws NotImplementedError
 */
export function compileShepthonToPython(source: string): string {
  // TODO: Implement Shepthon parser and Python codegen
  throw new NotImplementedError(
    "Shepthon compiler not yet implemented. Coming in Phase 2."
  );
}

/**
 * Shepthon configuration options.
 */
export interface ShepthonConfig {
  pythonVersion?: "3.9" | "3.10" | "3.11" | "3.12";
  strict?: boolean;
  typeHints?: boolean;
}

/**
 * Creates a Shepthon compiler with the given configuration.
 */
export function createCompiler(config: ShepthonConfig = {}) {
  return {
    compile: (source: string): string => {
      return compileShepthonToPython(source);
    },
    config,
  };
}
