/**
 * Configuration for Sheplang compilation.
 */

export interface SheplangCompilerConfig {
  /**
   * Target ECMAScript version.
   */
  target?: "es2020" | "es2021" | "es2022";

  /**
   * Enable strict type checking.
   */
  strict?: boolean;

  /**
   * Generate source maps.
   */
  sourceMap?: boolean;

  /**
   * Output directory for compiled files.
   */
  outDir?: string;

  /**
   * Root directory for source files.
   */
  rootDir?: string;
}

/**
 * Default Sheplang compiler configuration.
 */
export const DEFAULT_CONFIG: SheplangCompilerConfig = {
  target: "es2020",
  strict: true,
  sourceMap: true,
  outDir: "./dist",
  rootDir: "./src",
};
