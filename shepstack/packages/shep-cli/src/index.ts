/**
 * Shep CLI: Developer tools for the Shep language
 */

import { Command } from "commander";
import { compileCommand } from "./commands/compile.js";
import { devCommand } from "./commands/dev.js";
import { newCommand } from "./commands/new.js";
import { styleCommand } from "./commands/style.js";
import { verifyCommand } from "./commands/verify.js";
import { draftCommand } from "./commands/draft.js";

const program = new Command();

program
  .name("shep")
  .description("Shep language CLI")
  .version("0.0.1");

// Register commands
program.addCommand(compileCommand);
program.addCommand(devCommand);
program.addCommand(newCommand);
program.addCommand(styleCommand);
program.addCommand(verifyCommand);
program.addCommand(draftCommand);

/**
 * Main entry point for the CLI.
 */
export async function main(args: string[]): Promise<void> {
  await program.parseAsync(args, { from: "user" });
}
