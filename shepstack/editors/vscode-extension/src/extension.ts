/**
 * VS Code extension for Shep language support
 *
 * Provides editor integration with the Shep Language Server.
 * This is a skeleton that will be expanded in Phase 3.
 */

import * as vscode from "vscode";

/**
 * Activates the extension.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Shep language extension activated");

  // TODO: Wire up language server in Phase 3
  // For now, just log activation
  vscode.window.showInformationMessage(
    "Shep language support loaded (skeleton mode)"
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
  // Cleanup will be added in Phase 3
}
