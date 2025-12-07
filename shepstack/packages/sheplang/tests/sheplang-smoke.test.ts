/**
 * Smoke tests for sheplang.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { compileSheplangToTypeScript } from "../src/index.js";
import { NotImplementedError } from "@shep/core";

describe("Sheplang compiler", () => {
  it("should throw NotImplementedError", () => {
    assert.throws(
      () => {
        compileSheplangToTypeScript("component Hello {}");
      },
      NotImplementedError,
      "Compiler should throw NotImplementedError"
    );
  });

  it("should export compile function", () => {
    assert.ok(typeof compileSheplangToTypeScript === "function");
  });
});
