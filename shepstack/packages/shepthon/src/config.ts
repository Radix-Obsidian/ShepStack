/**
 * Configuration for Shepthon compilation.
 */

export interface ShepthonCompilerConfig {
  /**
   * Target Python version.
   */
  pythonVersion?: "3.9" | "3.10" | "3.11" | "3.12";

  /**
   * Enable strict type checking.
   */
  strict?: boolean;

  /**
   * Include type hints in generated code.
   */
  typeHints?: boolean;

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
 * Default Shepthon compiler configuration.
 */
export const DEFAULT_CONFIG: ShepthonCompilerConfig = {
  pythonVersion: "3.11",
  strict: true,
  typeHints: true,
  outDir: "./dist",
  rootDir: "./src",
};
