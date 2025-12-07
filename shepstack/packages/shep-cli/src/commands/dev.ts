/**
 * Dev command: starts a development server.
 */

import { Command } from "commander";

export const devCommand = new Command("dev")
  .description("Start development server")
  .option("--port <number>", "Port to run on", "3000")
  .action((options: { port: string }) => {
    console.log(`Starting dev server on port ${options.port}...`);
    console.log("Dev server not yet implemented. Coming in Phase 3.");
  });
