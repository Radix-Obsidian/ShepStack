/**
 * Smoke tests for shepthon.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { compileShepthonToPython } from "../src/index.js";
import { NotImplementedError } from "@goldensheepai/shep-core";

describe("Shepthon compiler", () => {
  it("should throw NotImplementedError", () => {
    assert.throws(
      () => {
        compileShepthonToPython("entity User {}");
      },
      NotImplementedError,
      "Compiler should throw NotImplementedError"
    );
  });

  it("should export compile function", () => {
    assert.ok(typeof compileShepthonToPython === "function");
  });
});
