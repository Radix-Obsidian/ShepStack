/**
 * Sheplang: TypeScript-targeting DSL
 *
 * Compiles Sheplang source code to TypeScript.
 */

import { NotImplementedError } from "@shep/core";

/**
 * Compiles Sheplang source code to TypeScript.
 * Currently a stub.
 *
 * @param source The Sheplang source code
 * @returns TypeScript source code
 * @throws NotImplementedError
 */
export function compileSheplangToTypeScript(source: string): string {
  // TODO: Implement Sheplang parser and TypeScript codegen
  throw new NotImplementedError(
    "Sheplang compiler not yet implemented. Coming in Phase 2."
  );
}

/**
 * Sheplang configuration options.
 */
export interface SheplangConfig {
  target?: "es2020" | "es2021" | "es2022";
  strict?: boolean;
  sourceMap?: boolean;
}

/**
 * Creates a Sheplang compiler with the given configuration.
 */
export function createCompiler(config: SheplangConfig = {}) {
  return {
    compile: (source: string): string => {
      return compileSheplangToTypeScript(source);
    },
    config,
  };
}
