/**
 * New command: scaffolds a new Shep project.
 */

import { Command } from "commander";

export const newCommand = new Command("new")
  .description("Create a new Shep project")
  .argument("<name>", "Project name")
  .action((name: string) => {
    console.log(`Creating new Shep project: ${name}`);
    console.log("Project scaffolding not yet implemented. Coming in Phase 3.");
  });
