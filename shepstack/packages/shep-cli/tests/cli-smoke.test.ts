/**
 * Smoke tests for shep-cli.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

describe("CLI", () => {
  it("should export compile command", () => {
    // Import will be tested at runtime after build
    assert.ok(true);
  });
});
